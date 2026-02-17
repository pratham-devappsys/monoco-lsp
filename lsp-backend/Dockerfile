# Dockerfile
FROM ubuntu:22.04

# Install prerequisites
RUN apt-get update && apt-get install -y \
    curl gnupg lsb-release software-properties-common git build-essential \
    && apt-get clean

# Add LLVM repo for latest clangd
RUN curl -fsSL https://apt.llvm.org/llvm-snapshot.gpg.key | gpg --dearmor -o /usr/share/keyrings/llvm.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/llvm.gpg] http://apt.llvm.org/jammy/ llvm-toolchain-jammy-16 main" \
       > /etc/apt/sources.list.d/llvm.list

# Install clangd-16
RUN apt-get update && apt-get install -y clangd-16 && apt-get clean

# Optional: Node.js for WebSocket bridge
RUN apt-get install -y nodejs npm && apt-get clean

# Set working directory
WORKDIR /workspace

# Copy bridge script (if you have it)
COPY ws-bridge.js /workspace/ws-bridge.js

# Expose port for WebSocket
EXPOSE 3001

# Default command
CMD ["node", "ws-bridge.js"]
