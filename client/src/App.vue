<template>
  <div id="app">
    <nav class="navbar navbar-light fixed-top navbar-expand-lg">
      <div class="container">
        <a class="navbar-brand text--smushed" href="/">
          <i class="fas fa-air-freshener pr-1"></i>
          millerbeach<strong>.community</strong>
        </a>

        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="sr-only">Toggle navigation</span>
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav ml-auto" id="site-navigation">

            <li class="nav-item">
              <a href="#visuals" onclick="window.location.href='/#visuals'; return false;" class="nav-link">Air Quality</a>
            </li>

            <li class="nav-item">
              <a href="#aqi-table" onclick="window.location.href='/#aqi-table'; return false;" class="nav-link">AQI Table</a>
            </li>

            <li class="nav-item">
              <a href="#industry" onclick="window.location.href='/#industry'; return false;" class="nav-link">Details</a>
            </li>

            <li class="nav-item">
              <a href="#historical-highs" onclick="window.location.href='/#historical-highs'; return false;" class="nav-link">Highs</a>
            </li>

            <li class="nav-item border border-danger">
              <a href="#report" onclick="window.location.href='/#report'; return false;" class="nav-link text-danger">Report</a>
            </li>

            <li class="nav-item d-none">
              <a href="#thanks" onclick="window.location.href='/#thanks'; return false;" class="nav-link">Thanks</a>
            </li>

            <li class="nav-item border-left ml-3">
              <router-link to="/about" class="nav-link">About</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main id="content">
      <router-view />
    </main>

    <footer class="pt-0 pt-md-5">
        <div class="container">
            <ul class="float-lg-raight list-inline text-center">
                <li class="d-xs-block d-lg-inline-block py-3 py-lg-0">
                    <a href="https://github.com/kingsloi/community-airmonitor" target="_blank">
                        I'm open source, fork your own!
                    </a>
                </li>
                <li class="d-xs-block d-lg-inline-block pl-md-5 py-3 py-lg-0">
                    <a href="https://github.com/kingsloi/community-airmonitor/issues" target="_blank">
                        Issues
                    </a>
                </li>
                <li class="d-xs-block d-lg-inline-block pl-md-5 py-3 py-lg-0">
                    <a class="buy-coffee" href="https://www.buymeacoffee.com/kingsloi" target="_blank">
                        <img class="mr-1" src="/images/buy-coffee.svg" alt="Buy the host a Coffee">
                      <span class="w-xl-75 d-xl-inline-block mx-xl-auto">help keep me online, buy me a coffee</span>
                    </a>
                </li>
            </ul>
        </div>
        <div class="container">
            <p class="made-with-love">made with<i class="fa fa-heart pulse"></i><a href="https://goo.gl/maps/Enx7PD4yEn6YhoF7A" target="_blank">IN Gary</a> by <a href="https://kingsley.sh">kingsley</a></p>
        </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo: {
    title: 'Miller Beach Air Quality, Weather, & Industry Dashboard',
    titleTemplate: '%s | Miller Beach Air Quality, Weather, & Industry Dashboard'
  },

  mounted() {
  },

  methods: {
  }
};
</script>

<style lang="sass">
  @import "assets/scss/app.scss"
  @import '../node_modules/leaflet/dist/leaflet.css'
</style>
