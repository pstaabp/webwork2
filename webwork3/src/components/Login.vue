<template>
  <div>
    <b-container>
      <b-row>
        <b-col offset-md="3" cols="6">
          <p>Welcome to Webwork</p>

          <b-form-group id="login-form"
            label-cols-sm="4" label-cols-lg="3"
            description="Login Name" label="Login Name" label-for="login">
            <b-form-input id="login"></b-form-input>
          </b-form-group>
          <b-form-group id="password-form"
            label-cols-sm="4" label-cols-lg="3"
            description="Password" label="Password" label-for="password">
            <b-form-input type="password" id="password"></b-form-input>
          </b-form-group>

        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  created: function(){
    // eslint-disable-next-line
    console.log("hi");
  }
}
</script>
