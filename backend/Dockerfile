# Step 1: Use an official Java Runtime Base Image
FROM eclipse-temurin:21-jre-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the JAR file from your target folder into the container
COPY target/*.jar app.jar

# Step 4: Expose the port your Spring Boot app runs on (default is 8080)
EXPOSE 8080

# Step 5: Command to run the application inside the container
ENTRYPOINT ["java", "-jar", "app.jar"]