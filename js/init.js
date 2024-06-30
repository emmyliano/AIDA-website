// Hook up the tweet display

$(document).ready(function() {
    $(".countdown").countdown({
        date: "15 July 2024 12:00:00", // Set your desired date and time here
        format: "on"
    },
    function() {
        // callback function
    });
});
