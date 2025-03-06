# Use a lightweight base image
FROM alpine:latest

# Install dependencies
RUN apk add --no-cache curl

# Copy PocketBase executable (download it from https://pocketbase.io/)
COPY pocketbase /pocketbase

# Expose the port PocketBase uses
EXPOSE 8090

# Start PocketBase
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090"]
