
<!-- PROJECT LOGO -->
<p align="center">
  <a href="#">
      <img src="https://github.com/Dudd-UIT/PJ-02-Mart-Management-FE/blob/main/public/images/logo.png?raw=true" width="120" alt="Nest Logo" />
    </a>
</p>
<p align="center"><b>BMart – Streamlining Mini Supermarket Operations for Efficiency, Accuracy, and Growth.</b></p>
    <p align="center">


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#About-The-Project">About The Project</a>
      <ul>
        <li><a href="#Introduction-to-the-BMart-Mini-Supermarket-Management-Application">Introduction</a></li>
          <li><a href="#Tech-Stack">Tech Stack</a></li>
      </ul>
    </li>
    <li>
      <a href="#Getting-Started">Getting Started</a>
      <ul>
        <li><a href="#Prerequisites">Prerequisites</a></li>
        <li><a href="#Installation">Installation</a></li>
      </ul>
    </li>
     <li><a href="#Usage">Usage</a></li>
     <li><a href="##Deploy-on-AWS-Cloud">Deploy on AWS Cloud</a></li>
     <li><a href="#Contributing">Contributing</a></li>
      
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project



### Introduction to the BMart Mini Supermarket Management Application
    
The BMart Mini Supermarket Management Application is a comprehensive solution designed to revolutionize the way mini supermarkets operate. Tailored specifically for the needs of small and medium-sized supermarkets, BMart addresses the complexities of managing inventory, suppliers, pricing, and daily operations.

With an intuitive interface and robust features, the application empowers business owners to:

- **Streamline Operations**: Automate inventory tracking, supplier management, and sales monitoring to reduce manual effort and errors.
- **Enhance Financial Accuracy**: Generate real-time revenue and profit reports, ensuring transparent and reliable financial tracking.
- **Simplify Pricing Strategies**: Optimize pricing for profitability while remaining competitive in the market.
- **Improve Customer and Employee Experience**: Enhance service quality with better stock availability and streamlined staff management.

The BMart app integrates advanced tools for real-time monitoring, insightful analytics, and user-friendly interfaces, making it an indispensable companion for modern mini supermarkets. Whether you're looking to scale your business or simply ensure smoother day-to-day operations, the BMart application provides the tools you need to thrive in a competitive retail landscape.


### Tech Stack

#### Frontend
- **Next.js** ![Next.js](https://img.shields.io/badge/-Next.js-black?logo=next.js&logoColor=white)
- **Bootstrap** ![Bootstrap](https://img.shields.io/badge/-Bootstrap-7952B3?logo=bootstrap&logoColor=white)


#### Backend
- **NestJS** ![NestJS](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white)
- **MySQL (RDS)** ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white)

#### DevOps & Infrastructure
- **Docker** ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white)
- **Amazon Web Services (AWS)** ![AWS](https://img.shields.io/badge/-AWS-232F3E?logo=amazon-aws&logoColor=white)
- **Nginx** ![Nginx](https://img.shields.io/badge/-Nginx-269539?logo=nginx&logoColor=white)

#### Monitoring
- **Prometheus** ![Prometheus](https://img.shields.io/badge/-Prometheus-E6522C?logo=prometheus&logoColor=white)
- **Grafana** ![Grafana](https://img.shields.io/badge/-Grafana-F46800?logo=grafana&logoColor=white)


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Before setting up the project, ensure your system meets the following requirements:

1. **Node.js** (version 18 or higher) and **npm** (Node Package Manager) must be installed.
   - To check if Node.js and npm are installed, run the following commands in your terminal:
     ```sh
     node -v
     npm -v
     ```
   - If not installed, download and install the latest version of Node.js from [Node.js official website](https://nodejs.org/).
   - After installing Node.js, update npm to the latest version by running:
     ```sh
     npm install npm@latest -g
     ```

2. **Docker** must be installed and running.
   - To verify Docker installation, run:
     ```sh
     docker --version
     ```
   - If Docker is not installed, download and install it from the [official Docker website](https://www.docker.com/get-started).
   - After installation, ensure Docker is running by starting the Docker Desktop application (on Windows/macOS) or the Docker service (on Linux).

Once these prerequisites are met, you can proceed to the next steps to set up and run the project.


### Installation

Follow these steps to set up the project on your local machine:

1. **Clone the Repositories**
   - Frontend:
     ```sh
     git clone https://github.com/Dudd-UIT/PJ-02-Mart-Management-FE.git
     ```
   - Backend:
     ```sh
     git clone https://github.com/Dudd-UIT/PJ-02-Mart-Management-BE.git
     ```

2. **Install NPM Packages**  
   - Navigate to the frontend directory and install dependencies:
     ```sh
     cd PJ-02-Mart-Management-FE
     npm install
     ```
   - Navigate to the backend directory and install dependencies:
     ```sh
     cd ../PJ-02-Mart-Management-BE
     npm install
     ```

3. **Create Environment Files**  
   - In both the frontend and backend directories, create a `.env` file 
   - Create the `.env` files with the appropriate values. Example configurations for the frontend `.env` file:
     ```env
     AUTH_SECRET=abc
     NEXTAUTH_URL=http://localhost:<your-port>
     NEXTAUTH_SECRET=abc
     AUTH_TRUST_HOST=true
     NEXT_PUBLIC_BACKEND_URL=http://localhost:<your-port>
     ```
   - Create the `.env` files with the appropriate values. Example configurations for the backend `.env` file:
     ```env
        NODE_ENV=development
        PORT=<your-backend-port>

        MYSQL_MASTER_HOST=localhost
        MYSQL_MASTER_PORT=3306


        MYSQL_SLAVE_HOST=localhost
        MYSQL_SLAVE_PORT=3306

        # Database - for single database
        DB_HOST=localhost
        DB_PORT=3307
        DB_USERNAME=root
        DB_PASSWORD=root
        DB_DATABASE=minimart

        JWT_SECRET=abc
        JWT_EXPIRATION_TIME=1h

        # CORS
        ALLOWED_ORIGINS=http://localhost:<your-port-frontend>

        REDIS_HOST=redis
        REDIS_PORT=6379

        AWS_S3_REGION=<your-aws-region>
        AWS_ACCESS_KEY_ID=<your-access-key>
        AWS_SECRET_ACCESS_KEY=<your-secret-access-key>

        MAIL_USER=<your-email>
        MAIL_PASSWORD=<your-email-password>

        APP_URL=http://localhost:<your-backend-port>

        RECOMMENDATION_SERVICE_URL=http://localhost:<your-recommendation-service-port>
     ```

4. **Run the Frontend**
   - Start the development server for the frontend:
     ```sh
     cd PJ-02-Mart-Management-FE
     npm start
     ```

5. **Run the Backend**
   - Start the server for the backend:
     ```sh
     cd ../PJ-02-Mart-Management-BE
     npm run start
     ```

6. **Set Up the MySQL Database**
   - Use Docker to create two MySQL containers in a master-slave setup. Follow the detailed instructions in - Section 3 in [this guide](https://hackmd.io/@baophong2401/S1Ak7ZWtR).

7. **Access the Web Application**
   - Open your browser and navigate to the frontend URL, typically:
     ```
     http://localhost:<your-port>
     ```
   - Log in with the default admin credentials:
     - **Email:** `dudd@mini.mart`
     - **Password:** `123`

  
  
  
  
<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

This section provides an overview of the main features and screens available in the web application. Below is a breakdown of each screen:

### 1. Login Screen
The login screen allows users to access the system using their credentials.  
- **Features**:
  - Secure user authentication.
  - Validation for input fields (e.g., email and password).
  - Error messages for incorrect credentials.
- **Example:**
  - URL: `/login`
  - Screenshot:  
    ![Login Screen](https://raw.githubusercontent.com/Dudd-UIT/PJ-02-Mart-Management-FE/main/public/assets/login.jpg)

---

### 2. Sales Screen
This screen is designed for employees to process and manage customer transactions efficiently.  
- **Features**:
  - Add items to the sales list by scanning barcodes or searching by name.
  - Real-time calculation of totals and taxes.
  - Print or email receipts for customers.
- **Example:**
  - URL: `/sales`
  - Screenshot:  
    ![Sales Screen](https://raw.githubusercontent.com/Dudd-UIT/PJ-02-Mart-Management-FE/main/public/assets/sale.png)

---

### 3. Inbound Management Screen
This screen allows administrators to manage incoming stock batches.  
- **Features**:
  - Add, update, or delete inbound receipts.
  - Track supplier information and product quantities.
  - Generate reports on stock levels.
- **Example:**
  - URL: `/`
  - Screenshot:  
    ![Inbound Management Screen](https://raw.githubusercontent.com/Dudd-UIT/PJ-02-Mart-Management-FE/main/public/assets/inbound.png)

---

### 4. Cart Screen
The cart screen displays items that the customer intends to purchase.  
- **Features**:
  - View list of selected items with their quantities and prices.
  - Update quantities or remove items from the cart.
  - Proceed to checkout.
- **Example:**
  - URL: `/cart`
  - Screenshot:  
    ![Cart Screen](https://raw.githubusercontent.com/Dudd-UIT/PJ-02-Mart-Management-FE/main/public/assets/cart.png)
    
    
### 5. Statistic Screen
The cart screen displays items that the customer intends to purchase.  
- **Features**:
  - View statistic of minimart with their chart and table.
- **Example:**
  - URL: `/statistic`
  - Screenshot:  
    ![Statistic Screen](https://raw.githubusercontent.com/Dudd-UIT/PJ-02-Mart-Management-FE/main/public/assets/statistic-1.png)
    ![Statistic Screen](https://raw.githubusercontent.com/Dudd-UIT/PJ-02-Mart-Management-FE/main/public/assets/statistic-2.png)

---

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Deploy on AWS Cloud

The architecture of this project is designed to ensure scalability, reliability, and maintainability. Below is an overview of the components used and how they interact. Below is the architecture diagram that illustrates the system's structure and component interactions:

![Architecture Diagram](https://raw.githubusercontent.com/Dudd-UIT/PJ-02-Mart-Management-FE/main/public/assets/aws-mart.png)

---

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AddFeature`)
3. Commit your Changes (`git commit -m 'Add some AddFeature'`)
4. Push to the Branch (`git push origin feature/AddFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/

[Nestjs]: https://img.shields.io/badge/Nest.js-nestjs?style=for-the-badge&logo=nestjs&logoColor=EA2858&labelColor=grey&color=grey
[Nestjs-url]: https://nestjs.com/