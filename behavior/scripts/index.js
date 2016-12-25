'use strict'

exports.handle = (client) => {
  // Create steps
  const sayHello = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().helloSent)
    },

    prompt() {
      client.addResponse('greeting')
      // client.addResponse('provide/documentation', {
      //   documentation_link: 'http://docs.init.ai',
      // })
      // client.addResponse('provide/instructions')

      client.updateConversationState({
        helloSent: true
      })

      client.done()
    }
  })

  const untrained = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('apology/untrained')
      client.done()
    }
  })

  const handleGreeting = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('greeting')
      client.done()
    }
  })

  const handleGoodbye = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('goodbye')
      client.done()
    }
  })

  const collectCity = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().weatherCity)
    },

    extractInfo() {
      const city = client.getFirstEntityWithRole(client.getMessagePart(), 'city')

      if (city) {
        client.updateConversationState({
          weatherCity: city,
        })

        console.log('User wants the weather in:', city.value)
      }
    },

    prompt() {
      client.addResponse('prompt/weather_city')
      client.done()
    },
  })

  const provideWeather = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      let weatherData = {
        temperature: 29,
        condition: 'ensolarado',
        city: client.getConversationState().weatherCity.value,
      }

      client.addResponse('provide_weather/current', weatherData)
      client.done()
    }
  })

  const collectUserInterest = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().botInfo)
    },

    extractInfo() {
      const userInterest = client.getFirstEntityWithRole(client.getMessagePart(), 'interest')

      if (userInterest) {
        client.updateConversationState({
          botInfo: userInterest,
        })

        console.log('User is interessed in:', userInterest.value)
      }
    },

    prompt() {
      client.addResponse('prompt/user_interest')
      client.done()
    },
  })

  const provideBotInfo = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      let botInformation = {
        interest: client.getConversationState().botInfo.value,
      }

      if (interest === "nome"){
        client.addResponse('provide_bot/name')
      }
      client.done()
    }
  })

  client.runFlow({
    classifications: {
      // map inbound message classifications to names of streams
      goodbye: 'goodbye',
      greeting: 'greeting',
      ask_current_weather: 'getWeather',
      ask_bot_info: 'getBotInfo'
    },
    autoResponses: {
      // configure responses to be automatically sent as predicted by the machine learning model
    },
    streams: {
      getWeather: [collectCity, provideWeather],
      goodbye: handleGoodbye,
      greeting: handleGreeting,
      getBotInfo: [collectUserInterest, provideBotInfo],
    main: 'onboarding',
    onboarding: [sayHello],
    end: [untrained]
    },
  })
}
