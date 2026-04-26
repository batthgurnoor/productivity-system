# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

COPY src src
RUN ./mvnw -q -DskipTests package

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
