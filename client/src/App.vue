<template>
  <div id="app">
    <nav class="navbar navbar-light fixed-top navbar-expand-lg">
      <div class="container">
        <a class="navbar-brand text--smushed" href="/">
          <i class="fas fa-air-freshener pr-1"></i>
          How's <strong class="text-uppercase">our</strong> Air Quality?
        </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="sr-only">Toggle navigation</span>
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
              <li class="nav-item"><a class="nav-link" href="/">Now</a></li>
          </ul>
        </div>
      </div>
    </nav>

    <main id="content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style lang="sass">
  @import "assets/scss/app.scss"
</style>
