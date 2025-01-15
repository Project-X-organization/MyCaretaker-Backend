# RentEase-Backend

Welcome to the RentEase-Backend repository! This project provides the backend services for the RentEase platform. Below are the installation instructions and rules to get started with the repository.

## Installation Steps

### 1. Clone the Repository
First, clone the repository to your local machine using the following command:

    ```bash
git clone https://github.com/your-username/RentEase-Backend.git
cd RentEase-Backend

2. Install Dependencies Using pnpm

This project uses pnpm as the package manager. If you don't have pnpm installed, follow these steps:
Install pnpm (If not already installed)

You can install pnpm globally via npm:

npm install -g pnpm

Or you can install it using Homebrew (on macOS):

brew install pnpm

Once pnpm is installed, run the following command to install the project dependencies:

pnpm install

This will install all the necessary packages specified in the package.json file.
3. Set Up Environment Variables

Ensure you have a .env file in the root of the project with the required environment variables. If one does not exist, you can create it by copying the example:

cp .env.example .env

Make sure to adjust the variables in .env for your local environment (such as database connection details, API keys, etc.).
4. Running the Application

To start the application in development mode, use:

pnpm dev

This will run the backend service in watch mode, so changes are reflected immediately.
5. Running Tests

To run tests, use the following command:

pnpm test

This will run the test suite and display the results in the terminal.
6. Build the Application

To build the application for production, use:

pnpm build

This will create an optimized build that can be deployed.
Additional Notes

    Always use pnpm for managing packages. Do not use npm or yarn in this project.
    When installing new packages, always run pnpm install to update your dependencies.
    If you are adding or updating environment variables, make sure to add them to the .env file and restart the server.

License

This project is licensed under the MIT License - see the LICENSE file for details.


### Key Points:
- The `pnpm` package manager is mentioned with installation steps.
- Instructions for cloning, setting up, running the app, and building are provided.
- Environment variable setup is covered.
- There's a reminder to always use `pnpm` for consistency.

You can further customize this based on your project needs! Let me know if you need any adjustments.

