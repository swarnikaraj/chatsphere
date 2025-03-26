import logging
import os
import json
import base64
import uuid
import functions_framework
from google.cloud import speech_v1
from google.cloud import storage
from google.oauth2 import service_account
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Path to the service account key JSON file
SERVICE_ACCOUNT_KEY_FILE = "service-account-key.json"

# GCS bucket for storing audio files
BUCKET_NAME = os.environ.get("BUCKET_NAME", "tube_genius")

# Initialize clients using the service account key
try:
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_KEY_FILE,
        scopes=['https://www.googleapis.com/auth/cloud-platform']
    )
    speech_client = speech_v1.SpeechClient(credentials=credentials)
    storage_client = storage.Client(credentials=credentials)
    logger.info("Successfully initialized clients")
except Exception as e:
    logger.error(f"Error initializing clients: {e}")
    raise

def upload_audio_to_gcs(audio_data, content_type):
    """Upload audio data to GCS and return the URI."""
    try:
        # Generate a unique filename
        file_extension = get_file_extension(content_type)
        filename = f"audio/{uuid.uuid4()}{file_extension}"

        # Get bucket and create blob
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)

        # Upload the audio data
        blob.upload_from_string(
            audio_data,
            content_type=content_type
        )

        logger.info(f"Uploaded audio to gs://{BUCKET_NAME}/{filename}")
        return f"gs://{BUCKET_NAME}/{filename}"

    except Exception as e:
        logger.error(f"Error uploading audio to GCS: {e}")
        raise

def get_file_extension(content_type):
    """Get file extension based on content type."""
    content_type_map = {
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
        "audio/wave": ".wav",
        "audio/webm": ".webm",
        "audio/mp3": ".mp3",
        "audio/mpeg": ".mp3",
        "audio/ogg": ".ogg",
        "audio/flac": ".flac",
        "audio/x-flac": ".flac"
    }
    return content_type_map.get(content_type, ".wav")

def wait_for_operation(operation):
    """Wait for the long-running operation to complete."""
    try:
        result = operation.result(timeout=600)  # 10-minute timeout
        return result
    except Exception as e:
        logger.error(f"Error waiting for operation: {e}")
        raise

def process_transcription_results(response):
    """Process the transcription response to extract text."""
    try:
        full_transcript = ""
        for result in response.results:
            if result.alternatives:
                transcript = result.alternatives[0].transcript
                full_transcript += transcript + " "

        return full_transcript.strip()

    except Exception as e:
        logger.error(f"Error processing transcription results: {e}")
        return ""

@functions_framework.http
def upload_and_transcribe_audio(request):
    """
    Cloud Function to transcribe audio using Google Speech-to-Text API.
    Accepts audio data in the request, uploads it to GCS, and returns the transcribed text.
    """
    try:
        # Set CORS headers
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json",
        }

        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            return "", 204, headers

        # Parse JSON request
        request_json = request.get_json(silent=True)
        if not request_json:
            return json.dumps({"error": "Invalid request format"}), 400, headers

        # Check if request contains audio_uri or audio_data
        audio_uri = None
        if "audio_uri" in request_json:
            # Use provided URI directly
            audio_uri = request_json["audio_uri"]
            logger.info(f"Using provided audio URI: {audio_uri}")
        elif "audio_data" in request_json and "content_type" in request_json:
            # Upload audio data to GCS
            audio_data = base64.b64decode(request_json["audio_data"])
            content_type = request_json["content_type"]
            audio_uri = upload_audio_to_gcs(audio_data, content_type)
            logger.info(f"Uploaded audio to: {audio_uri}")
        else:
            return json.dumps({"error": "Either audio_uri or audio_data with content_type is required"}), 400, headers

        # Get other parameters
        language_code = request_json.get("language_code", "en-US")
        long_audio = request_json.get("long_audio", False)  # Default is False

        # Configure the audio source
        audio = speech_v1.RecognitionAudio(uri=audio_uri)

        # Determine encoding based on content type
        encoding = speech_v1.RecognitionConfig.AudioEncoding.LINEAR16
        if "content_type" in request_json:
            if "webm" in request_json["content_type"]:
                encoding = speech_v1.RecognitionConfig.AudioEncoding.WEBM_OPUS
            elif "mp3" in request_json["content_type"] or "mpeg" in request_json["content_type"]:
                encoding = speech_v1.RecognitionConfig.AudioEncoding.MP3
            elif "flac" in request_json["content_type"]:
                encoding = speech_v1.RecognitionConfig.AudioEncoding.FLAC
            elif "ogg" in request_json["content_type"]:
                encoding = speech_v1.RecognitionConfig.AudioEncoding.OGG_OPUS

        # Configure the request
        sample_rate = 48000 if "webm" in request_json.get("content_type", "").lower() else 16000

        config = speech_v1.RecognitionConfig(
            encoding=encoding,
            sample_rate_hertz=sample_rate,  # Updated this line
            language_code=language_code,
            enable_automatic_punctuation=True,
            enable_word_confidence=True,
            model="video"  # Using video model for better accuracy
        )

        if long_audio:
            # For longer audio files, use long_running_recognize and wait
            operation = speech_client.long_running_recognize(config=config, audio=audio)
            logger.info("Waiting for long-running transcription to complete...")
            response = wait_for_operation(operation)
        else:
            # For shorter audio files, use synchronous recognition
            logger.info("Using synchronous recognition...")
            response = speech_client.recognize(config=config, audio=audio)

        # Process the response and get the transcript
        transcript = process_transcription_results(response)

        return json.dumps({
            "text": transcript
        }), 200, headers

    except Exception as e:
        logger.error(f"Error processing transcription request: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return json.dumps({"error": str(e)}), 500, headers

if __name__ == "__main__":
    print("Speech-to-Text API Service initialized")