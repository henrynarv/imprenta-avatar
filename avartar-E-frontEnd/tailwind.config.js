/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#98D13B",
        "primary-dark": "#7AB02F", // versión hover
        "primary-light": "#B8E865", // versión suave
        "navbar-color":"#908787"
      },
    },
  },
  plugins: [
  //    function({ addComponents }) {
  //   addComponents({
  //     '.form-input': {
  //       padding: '.5rem .75rem',
  //       borderRadius: '.375rem',
  //       border: '1px solid #d1d5db', // gris
  //       '&:focus': {
  //         outline: 'none',
  //         borderColor: '#98D13B', // tu primary
  //         boxShadow: '0 0 0 2px rgba(152, 209, 59, 0.4)',
  //       },
  //     },
  //   })
  // }
  ],
}
