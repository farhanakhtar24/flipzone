# E-Commerce App

## Overview

This repository hosts the source code for a feature-rich e-commerce application. The app provides a seamless shopping experience, including features like user authentication, product browsing, cart management, wishlist, order tracking, and more.

---

## Features

### Authentication and User Management

- **Full Authentication**: OAuth integration, protected routes, and error handling.
- **Profile Management**: Edit and update user profiles with a dedicated UI and APIs.
- **Custom Middleware**: Middleware configurations for session management and security.

### Product Browsing and Filtering

- **Product Page**: Detailed product pages with features like specifications table, ratings, photo gallery, and price details.
- **Category Filters**: Filter products by category, price, stock status, and sorting options.
- **Search**: Integrated search bar for quick product lookups.

### Cart and Wishlist

- **Cart Management**: Dynamic cart page with increment/decrement actions, order placement, and redirection to the orders page.
- **Wishlist**: APIs for adding/removing items from the wishlist and a dedicated wishlist page.

### Order Management

- **Orders Page**: View and manage orders with actions to fetch all orders or a specific order by ID.

### Reviews and Ratings

- **Review System**: Users can add, edit, and delete reviews for purchased products.
- **Review Management**: Functionalities for rendering and managing review items.

### Comparison and Other Features

- **Comparison Feature**: Compare up to four products simultaneously.
- **UI Enhancements**: Optimized layout, navigation bar, and toast notifications for actions.

---

## Recent Updates

### October 2024

- Added **cart functionality**, including dynamic updates and order placement.
- Introduced a **wishlist and comparison feature**, allowing users to wishlist and compare products.
- Enhanced product actions with features like detecting cart inclusion and improving button states.

### November 2024

- Added **category filters**, including sort-by options and a price slider.
- Developed a **profile section** with full CRUD operations for profile data.
- Introduced the **orders page** for viewing and managing user orders.

---

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/username/repository.git
   cd repository
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the necessary configuration.

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Access the app**:
   Open your browser and navigate to `http://localhost:3000`.

---

## Technologies Used

- **Frontend**: Next.js, React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: OAuth, JWT
- **Styling**: Tailwind CSS

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes and push to your fork.
4. Create a pull request with a detailed description.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

For inquiries, open an issue or reach out to the maintainer at [akhtar.farhan779@gmail.com](mailto:akhtar.farhan779@gmail.com).
