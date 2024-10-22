# Kreios Data Platform Test Task

Welcome! This repository contains real-world code extracted from the larger Kreios Data Platform (also known as Liquidata) codebase. Its purpose is to serve as a playground for test tasks used by the Data Platform team to evaluate candidates who have applied to our job ad on Upwork.com. These tasks will help us decide which new team member(s) we want to onboard to the project long-term.

## Getting Started

Before diving into the challenges, we encourage you to **familiarize yourself with the codebase**. Take some time to explore the repository structure, understand how the components interact, and get your bearings. This initial step will help you approach the challenges more effectively.

## Repository Structure

The repository is organized into two main folders:

1. **packages**: Contains two components taken from the Data Platform codebase. These are the main components you will be working on in the scope of this test task.
2. **tooling**: Contains some tooling configuration and tweaks used by the overall Turbo repo.

### Packages

#### 1. File Storage API (`storage`)

The `storage` package provides the Data Platform's abstraction around various storage backends that the project needs to support. This flexibility is crucial as the Data Platform serves as a foundation for various customer projects, each with different preferences regarding storage backends (e.g., depending on their preferred Cloud platform).

Currently, the storage package supports two implementations of its SPI interface:

- Azure Blob Storage
- AWS S3

#### 2. Job Dispatcher API (`jobs`)

The `jobs` package provides the Data Platform's abstraction for asynchronous background jobs and their dispatch mechanism. The current implementation uses Upstash QStash.

To expose the endpoint to be invoked by the external, serverless job dispatcher in a Next.js application, we typically create an API route that uses the `requestHandler` from our `jobs` package. Here's an example of how this is typically implemented:

```ts
// app/api/jobs/[type]/route.ts

import { requestHandler } from "@myapp/jobs"

export const runtime = "nodejs"
export const maxDuration = 300

export const POST = requestHandler
```

## Challenges

After you've familiarized yourself with the codebase, please complete **both** of the following challenges. We're interested in seeing your problem-solving approach and coding style.

1. **Update Job Dispatcher to Use Trigger.dev**

   Replace the current Upstash QStash implementation with [Trigger.dev](https://trigger.dev) in the `jobs` package. Trigger.dev is preferred because it's open-source and can be self-hosted, which allows for more flexibility in development (e.g., inside `docker-compose.yml`) and production (e.g., on the project's Kubernetes cluster) environments.

2. **Refactor Job Dispatcher for Swappable Providers**

   Restructure the `jobs` package to support swappable provider implementations using a common Service Provider Interface (SPI), similar to the architecture in the `storage` package. This will allow for easier integration of different job dispatcher services in the future.

## How to Approach the Task

- **Time Management and Logging**: Please spend **no more than one day** (approximately 8 hours) on this test task. To keep the process efficient, try to complete your work within a timeframe of **2-3 days**. It's crucial to log your time accurately as you work. Retroactive time logging is not possible, so track your time diligently throughout the process and do not exceed the maximum allotted number of billable hours (8 hours).

- **Quality Over Quantity**: Focus on delivering well-thought-out and high-quality code. It's crucial to ensure that your changes actually work and that existing unit tests continue to pass. Remember, it's not just about completing the tasks; it's about how you approach them. Ensure your changes are well-tested, functional, and don't break existing functionality.

- **Use of AI Tools**: You are free to use AI tools such as GitHub Copilot or Cursor AI. However, it's essential that you understand and can explain every change you make. Keep unnecessary changes to a minimum and ensure that your solution is functional and well-tested before submission.

- **Communication**: If you have any questions or need clarification, feel free to reach out to us via Upwork. We're here to help!

## How to Submit Your Work

1. **Set Up the Repository**: Unzip the provided git repository and start working on it as you would on a real project.
2. **Create a New Branch**: Create a new branch for your work.
3. **Commit Frequently**: As you progress, commit your changes frequently with clear, descriptive commit messages. This helps us understand your thought process and development approach.
4. **Finalize Your Work**: Once you're satisfied with your work, ensure all your changes are committed.
5. **Package the Repository**: Zip the entire git repository, including the `.git` folder to preserve the commit history.
6. **Submit via Upwork**: Share the zipped repository with us through Upwork.
7. **Include a Submission Message**: In your submission message on Upwork, please include:
   - A brief overview of the changes you made.
   - Any challenges you faced and how you overcame them.
   - An explanation of how you tested your changes and ensured they work correctly.
   - Any additional thoughts or explanations about your implementation.

## Important Notes

- **Review Time**: We will typically take **1-2 days** to review your submission and provide feedback.

- **Confidentiality**: Please treat all provided materials as confidential and do not share them publicly.

- **We're Here to Help**: While working on the task, feel free to send us any questions you might have via Upwork.

Good luck, and we look forward to seeing your work!
