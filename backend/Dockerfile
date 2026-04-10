FROM maven:3.9.12-eclipse-temurin-21-alpine AS build

WORKDIR /workspace

COPY pom.xml ./

COPY .mvn .mvn

COPY mvnw ./

RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src src

RUN ./mvnw -B -DskipTests package

FROM registry.access.redhat.com/ubi9/openjdk-21:1.23

WORKDIR /deployments

COPY --from=build /workspace/target/quarkus-app/lib/ ./lib/
COPY --from=build /workspace/target/quarkus-app/*.jar ./
COPY --from=build /workspace/target/quarkus-app/app/ ./app/
COPY --from=build /workspace/target/quarkus-app/quarkus/ ./quarkus/

# curl para healthcheck do Docker Compose (/q/health/live)
USER root
RUN microdnf install -y curl-minimal && microdnf clean all
COPY --from=mwader/static-ffmpeg:8.1 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:8.1 /ffprobe /usr/local/bin/
USER 185

EXPOSE 8080

ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"
ENV JAVA_OPTS_APPEND="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

ENTRYPOINT [ "/opt/jboss/container/java/run/run-java.sh" ]
