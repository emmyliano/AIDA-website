document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        
        // Get form data
        const formData = new FormData(form);
        
        // Example of handling form data manually (for reference)
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Example of redirecting based on conditions
        if (email === 'admin@aida.com' && password === 'videochatbot') {
            window.location.href = 'first_screen.html';
        } else {
            // Display error message or handle incorrect credentials
            alert('Incorrect email or password. Please try again.');
        }
    });
});
