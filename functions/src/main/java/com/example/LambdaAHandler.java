package com.example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;

import java.nio.charset.StandardCharsets;
import java.util.Map;

public class LambdaAHandler implements RequestHandler<Map<String, Object>, String> {

    public String handleRequest(Map<String, Object> event, Context context) {
        String name = (String) event.get("name");
        Integer age = (Integer) event.get("age");

        if (name == null || age == null) {
            return "Invalid input: 'name' and 'age' are required.";
        }

        try (LambdaClient lambdaClient = LambdaClient.create()) {
            String payload = String.format("{\"name\":\"%s\", \"age\":%d}", name, age);

            InvokeRequest invokeRequest = InvokeRequest.builder()
                    .functionName(System.getenv("LAMBDA_B_ARN")) // Lambda B ARN from environment variable
                    .payload(SdkBytes.fromByteBuffer(StandardCharsets.UTF_8.encode(payload)))
                    .build();

            InvokeResponse response = lambdaClient.invoke(invokeRequest);

            if (response.statusCode() == 200) {
                return "Successfully invoked Lambda B. Response: " + response.payload().asUtf8String();
            } else {
                return "Failed to invoke Lambda B. Status Code: " + response.statusCode();
            }
        } catch (Exception e) {
            context.getLogger().log("Error invoking Lambda B: " + e.getMessage());
            return "Error invoking Lambda B.";
        }
    }
}
