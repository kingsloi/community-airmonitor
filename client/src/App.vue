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
          <ul class="nav navbar-nav ml-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Currently</router-link>
            </li>
<!--
            <li class="nav-item">
              <router-link to="/previous" class="nav-link">Previous</router-link>
            </li>
-->
            <li class="nav-item">
              <router-link to="/history" class="nav-link">Updates</router-link>
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
                        <img class="mr-1" src="/images/buy-coffee.svg" alt="Buy the host a Coffee">Show your Support</a>
                </li>
            </ul>
        </div>
        <div class="container">
            <p class="made-with-love">made with<i class="fa fa-heart pulse"></i><a href="https://goo.gl/maps/Enx7PD4yEn6YhoF7A" target="_blank">IN Gary</a> by <a href="mailto:kingsley.raspe@protonmail.ch">kingsley</a></p>
        </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo: {
    title: 'Miller Beach / Gary / NWI Air Quality',
    titleTemplate: '%s | Miller Beach / Gary / NWI Air Quality'
  }
};
</script>

<style lang="sass">
  @import "assets/scss/app.scss"
  @import '../node_modules/leaflet/dist/leaflet.css'
</style>
