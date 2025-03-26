import { NextResponse } from 'next/server';

import {
    RekognitionClient,
    SearchFacesByImageCommand,

} from '@aws-sdk/client-rekognition';


const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: Request) {
    try {
        const { faceImage, faceId } = await req.json();

        if (!faceImage || !faceId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(faceImage.split(',')[1], 'base64');

        // First, search for the face in the collection
        const searchResponse = await rekognition.send(
            new SearchFacesByImageCommand({
                CollectionId: 'user-faces',
                Image: {
                    Bytes: buffer
                },
                FaceMatchThreshold: 90, // Slightly lower threshold for better matching
                MaxFaces: 5 // Get multiple matches to ensure we don't miss the right one
            })
        );

        console.log('Search response:', JSON.stringify(searchResponse, null, 2));

        // Check if we found any matches
        if (!searchResponse.FaceMatches || searchResponse.FaceMatches.length === 0) {
            console.log('No face matches found');
            return NextResponse.json({ verified: false, reason: 'No matching faces found' });
        }

        // Look for the specific face ID in the matches
        const matchingFace = searchResponse.FaceMatches.find(
            match => match.Face?.FaceId === faceId
        );

        if (!matchingFace) {
            console.log('Specific face ID not found in matches');
            return NextResponse.json({ verified: false, reason: 'Face ID not found in matches' });
        }

        // Check the similarity score
        const similarity = matchingFace.Similarity || 0;
        const verified = similarity >= 90;

        console.log('Face verification result:', {
            faceId,
            similarity,
            verified
        });

        return NextResponse.json({
            verified,
            similarity,
            matchDetails: {
                confidence: matchingFace.Face?.Confidence,
                similarity: matchingFace.Similarity
            }
        });

    } catch (error) {
        console.error('Face verification error:', error);
        return NextResponse.json(
            {
                error: 'Face verification failed',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}