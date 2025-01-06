package com.example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class LambdaBHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {
    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {
        // Extract processed data from event
        String processedName = (String) event.get("processedName");
        Integer processedAge = (Integer) event.get("processedAge");

        // Validate input
        if (processedName == null || processedAge == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid input: 'name' and 'age' are required.");
            errorResponse.put("statusCode", 400);
            return errorResponse;
        }

        // Prepare JSON data to store in S3
        String data = String.format("{\"name\":\"%s\", \"age\":%d}", processedName, processedAge);

        try (S3Client s3Client = S3Client.create()) {
            // Fetch bucket name from environment variable
            String bucketName = System.getenv("S3_BUCKET_NAME");
            context.getLogger().log("Bucket Name: " + bucketName);

            // Define the S3 key
            String key = "data/" + processedName.toLowerCase() + ".json";

            // Prepare the S3 PutObjectRequest
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("application/json")
                    .build();

            // Store the JSON data in S3
            s3Client.putObject(putObjectRequest, RequestBody.fromString(data, StandardCharsets.UTF_8));

            context.getLogger().log("Successfully stored data in S3 with key: " + key);
            Map<String, Object> result = new HashMap<>();
            result.put("Message", "Successfully processed and stored data in S3: " + key);
            result.put("statusCode", 200);
            return result;
        } catch (Exception e) {
            // Log and handle errors
            context.getLogger().log("Error storing data in S3: " + e.getMessage());
            if (e.getMessage().contains("AccessDenied")) {
                context.getLogger().log("Verify IAM permissions for this Lambda function.");
            }
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error storing data in S3: " + e.getMessage());
            errorResponse.put("statusCode", 500);
            return errorResponse;
        }
    }
}