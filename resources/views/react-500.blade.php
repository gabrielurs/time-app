<!-- resources/views/react-500.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Error</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    @viteReactRefresh
    @vite('resources/css/app.css')
    <!-- Styles -->
    <style>
        body {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-style: normal;
        }
    </style>
</head>
</head>
<body>
    <div id="app"></div>
    <script>
        window.__INITIAL_STATE__ = {
            errorCode: 500,
            errorMessage: "Oops! Something went wrong on our end. Please try again later."
        };
    </script>
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>

