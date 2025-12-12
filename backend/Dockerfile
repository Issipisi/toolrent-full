# ---- build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# ---- runtime stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# IMPORTANTE: Usar ruta absoluta y patrón
COPY --from=build /app/target/Toolrent-backend.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java","-jar","/app/app.jar"]