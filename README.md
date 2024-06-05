# Weather App Project

Hi! My name is Gabriel. I'm a junior application developer with a strong focus on web development. I'm also passionate about web and app design in general.

I'm excited to build a weather app! While it may seem like a simple project, it's a great way for me to learn and grow as a developer. In this project, I'll be using a variety of technologies that I'll explain in detail throughout the process.

---

## Technologies Used

- **Front End:** React, Tailwind CSS
- **Back End:** Laravel API
- **Data Layer:** MySQL, 7Timer API

For the front-end, I'll be using React and Tailwind CSS. React is a great choice for building Single-Page Applications (SPAs) due to its component-based architecture and virtual DOM. Tailwind provides a utility-first approach to CSS that makes styling components and layouts a breeze.

On the back-end, I'll be leveraging Laravel to handle application logic and API interactions. Laravel offers a robust framework that streamlines development and ensures clean code. The application will consume an internal API built with Laravel to manage data access and manipulation.

For the data layer, I'll utilize a MySQL database for persistent storage. Additionally, I'll integrate an external API from 7timer to retrieve real-time weather data. This combination ensures both local data storage and access to up-to-date weather information.

---

## Development Approach

To ensure quality and maintainability, I'll follow the Test-Driven Development (TDD) approach. This means writing unit and integration tests before developing the actual code. This proactive approach helps identify and fix issues early on, leading to a more stable and well-tested application.

Once the testing suite is complete, I'll move on to designing the user interface (UI) for the weather app.

---

## App Functionality

As I mentioned, the app is designed to be simple. Here's how it will work:

1. **User Visits Page:** When a user visits the app, it will first try to determine their location using their IP address.
2. **IP Location Check:** This provides a starting point, but IP location data isn't always precise.
3. **Database Check:** The app will check its internal database of approximately 47,000 cities to see if the city exists.
4. **Weather Data Retrieval:** Once the user's location is established, the app will send a request to the 7Timer API. It will include the user's latitude and longitude coordinates to retrieve detailed weather data in JSON format.
5. **Data Processing and Display:** The app will then process the received weather data. This might involve translation if necessary. Finally, it will present this information in a clear and user-friendly way on the screen.
6. **Search Bar:** If both the IP location and database lookup are unsuccessful in pinpointing the user's exact location, the app will offer a search bar as a backup. This allows users to manually search for their specific city and obtain accurate weather data.

---


