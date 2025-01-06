package com.example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import java.util.HashMap;
import java.util.Map;

public class LambdaAHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {

        context.getLogger().log("Lambda A received: " + event);
        String name = (String) event.get("name");
        Integer age = (Integer) event.get("age");

        // Validate input
        if (name == null || age == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid input: 'name' and 'age' are required.");
            errorResponse.put("statusCode", 400);
            return errorResponse;
        }

        // Process input (e.g., transform name to uppercase)
        String processedName = name.toUpperCase();
        int processedAge = age + 1;

        // Return processed data
        Map<String, Object> result = new HashMap<>();
        result.put("processedName", processedName);
        result.put("processedAge", processedAge);
        result.put("statusCode", 200);
        context.getLogger().log("Lambda A processed: " + result);
        return result;
    }
}