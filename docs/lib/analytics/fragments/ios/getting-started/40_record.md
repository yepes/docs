To record an event,  specify your event using `BasicAnalyticsEvent` and call `Amplify.Analytics.record()`

```swift
func recordEvents() {
    let properties: [String: AnalyticsPropertyValue] = [
        "eventPropertyStringKey": "eventPropertyStringValue",
        "eventPropertyIntKey": 123,
        "eventPropertyDoubleKey": 12.34,
        "eventPropertyBoolKey": true
    ]
    let event = BasicAnalyticsEvent("eventName", properties: properties)
    Amplify.Analytics.record(event: event)
}
```