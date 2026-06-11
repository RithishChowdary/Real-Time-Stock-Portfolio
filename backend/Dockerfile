# Step 1: Use an official Java Runtime Base Image
# Step 2: Set the working directory inside the container
# Step 3: Copy the JAR file from your target folder into the container
# Step 4: Expose the port your Spring Boot app runs on (default is 8080)
# Step 5: Command to run the application inside the container
# Build Stage
FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]