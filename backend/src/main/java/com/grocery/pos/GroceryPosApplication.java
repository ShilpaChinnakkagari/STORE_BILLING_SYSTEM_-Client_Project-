
package com.grocery.pos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GroceryPosApplication {
    public static void main(String[] args) {
        SpringApplication.run(GroceryPosApplication.class, args);
        System.out.println("🚀 Grocery POS Backend Started Successfully!");
        System.out.println("📊 API available at: http://localhost:8080");
        System.out.println("📖 Swagger UI: http://localhost:8080/swagger-ui.html");
    }
}