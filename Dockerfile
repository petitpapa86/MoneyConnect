# Use the slim version of the latest Node.js runtime as a parent image
FROM node:23-slim

# Set the working directory in the container
WORKDIR /app

# Install AWS CDK globally
RUN npm install -g aws-cdk

# Install Serverless Framework globally
RUN npm install -g serverless

# Install TypeScript globally
RUN npm install -g typescript

# Install additional tools (optional): AWS CLI
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip && \
    pip3 install awscli && \
    apt-get clean && \ && \
    rm -rf /var/lib/apt/lists/*    rm -rf /var/lib/apt/lists/*

# Verify installations
RUN node -v && npm -v && cdk --version && sls --version && tsc --version && aws --versionRUN node -v && npm -v && cdk --version && sls --version && tsc --version && aws --version

# Expose port (optional, if running a local server)rt (optional, if running a local server)
EXPOSE 3000

# Set the default command (optional)fault command (optional)

CMD ["bash"]CMD ["bash"]