<!-- resources/views/react-500.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Error</title>
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
