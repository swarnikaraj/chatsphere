import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
    RekognitionClient,
    IndexFacesCommand,
} from '@aws-sdk/client-rekognition';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';



const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: Request) {
    try {
        const { name, email, password, faceImage } = await req.json();

        // Validate face image
        if (!faceImage || !faceImage.includes('base64')) {
            return NextResponse.json(
                { error: 'Invalid face image format' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // Create user first to get the MongoDB ObjectId
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });

        // Use the MongoDB ObjectId as the external image ID
        const userId = user.id;

        // Upload face image to S3
        const buffer = Buffer.from(faceImage.split(',')[1], 'base64');
        const s3Key = `faces/${userId}/${Date.now()}.jpg`;

        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: s3Key,
            Body: buffer,
            ContentType: 'image/jpeg'
        }));

        // Index face in Rekognition with ExternalImageId
        const indexFacesResponse = await rekognition.send(
            new IndexFacesCommand({
                CollectionId: 'user-faces',
                Image: {
                    Bytes: buffer
                },
                ExternalImageId: userId,
                DetectionAttributes: ['ALL'],
                QualityFilter: 'AUTO',
                MaxFaces: 1
            })
        );

        if (!indexFacesResponse.FaceRecords || indexFacesResponse.FaceRecords.length === 0) {
            // If face indexing fails, delete the created user
            await prisma.user.delete({
                where: { id: userId }
            });

            return NextResponse.json(
                { error: 'No face detected in the image' },
                { status: 400 }
            );
        }

        const faceId = indexFacesResponse.FaceRecords[0].Face?.FaceId;

        if (!faceId) {
            // If face ID is not returned, delete the created user
            await prisma.user.delete({
                where: { id: userId }
            });

            return NextResponse.json(
                { error: 'Failed to index face' },
                { status: 400 }
            );
        }

        // Update user with faceId and s3Key
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                faceId,
                s3Key
            }
        });

        console.log('Face indexed successfully:', {
            faceId,
            userId,
            s3Key
        });

        return NextResponse.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            faceId: updatedUser.faceId
        });

    } catch (error) {
        console.log('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}