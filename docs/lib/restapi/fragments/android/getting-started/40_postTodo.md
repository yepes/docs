<amplify-block-switcher>
<amplify-block name="Java">

```java
RestOptions options = new RestOptions("/todo");

Amplify.API.post(options,
        response -> Log.i("MyAmplifyApp", response.getData().asString()),
        error -> Log.e("MyAmplifyApp", "POST failed", error)
);
```


</amplify-block>
<amplify-block name="Kotlin">

```kotlin
val options = RestOptions("/todo")

Amplify.API.post(options,
        { response -> Log.i("MyAmplifyApp", response.getData().asString()) },
        { error -> Log.e("MyAmplifyApp", "POST failed", error) }
)
```

</amplify-block>
</amplify-block-switcher>

<amplify-callout warning>

Certain versions of the Amplify CLI will create classes used with the Android SDK for Android in your project. If you see compilation errors relating to `com.amazonaws.mobileconnectors.apigateway.annotation`, please delete the directory with the name of your API in Android Studio.

</amplify-callout>