package com.example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Map;

public class LambdaBHandler implements RequestHandler<Map<String, Object>, String> {
    @Override
    public String handleRequest(Map<String, Object> event, Context context) {
        String name = (String) event.get("name");
        Integer age = (Integer) event.get("age");

        if(name == null || age == null)
            return " please you need to provide name and age";

        String incrementedName = name.toLowerCase();
        Integer incrementedAge = age + 1;

        String data = String.format("{\"name\":\"%s\", \"age\":%d}", incrementedName, incrementedAge);

        try (S3Client s3Client = S3Client.create()) {
            String bucketName = System.getenv("S3_BUCKET_NAME"); // Bucket name from environment variable
            String key = "data/" + incrementedName + ".json";

            // Prepare the S3 PutObjectRequest
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("application/json")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromString(data, StandardCharsets.UTF_8));

            return "Successfully processed and stored data in S3: " + key;
        } catch (Exception e) {
            context.getLogger().log("Error storing data in S3: " + e.getMessage());
            return "Error storing data in S3.";
        }
    }
}
