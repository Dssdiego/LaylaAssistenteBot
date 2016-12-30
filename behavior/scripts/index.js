'use strict'

var c_Cats = 0

exports.handle = (client) => {
  let catImages = 
        [
         'http://24.media.tumblr.com/tumblr_lzoc33JZ7k1qb7j67o1_250.jpg',
         'http://25.media.tumblr.com/tumblr_kp2kxdwTpr1qzv5pwo1_250.jpg',
         'http://25.media.tumblr.com/tumblr_m3b5dhmcLF1qzyqubo1_250.jpg',
         'http://25.media.tumblr.com/tumblr_li6itvRslB1qfyzelo1_250.jpg',
         'http://24.media.tumblr.com/Jjkybd3nSces48pnerQxzaA2_250.jpg'
        ]

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

      if (botInformation.interest == 'nome'){
        client.addResponse('provide_bot/name')
      }

      else if (botInformation.interest == 'idade'){
        client.addResponse('provide_bot/age')
      }

      else {
        client.addResponse('apology/untrained')
      }

      client.done()
    }
  })

  const provideBotFeedback = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      let subClassification = client.getMessagePart().classification.sub_type.value
      console.log ('teste' + subClassification)

      if (subClassification === 'positive') {
        client.addResponse('provide_feedback_adjective/positive')
      } 

      else if (subClassification === 'negative') {
        client.addResponse('provide_feedback_adjective/negative')
      }

      else {
        client.addResponse('apology/untrained')
      }

      client.done()
    }
  })

  const provideHumorFeedback = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      // Math.random()

      c_Cats = c_Cats + 1

      client.addResponse('provide_feedback_humor/negative') 
      //client.addImageResponse('http://thecatapi.com/api/images/get?api_key=MTQ2ODUw&size=small')
      client.addImageResponse(catImages[c_Cats])

      client.done()
    }
  })
  
  client.runFlow({
    classifications: {
      // map inbound message classifications to names of streams
      goodbye: 'goodbye',
      greeting: 'greeting',
      ask_current_weather: 'getWeather',
      ask_bot_info: 'getBotInfo',
      feedback_bot_adjective: 'getBotFeedback',
      feedback_user_humor: 'getHumorFeedback'
    },
    autoResponses: {
      // configure responses to be automatically sent as predicted by the machine learning model
    },
    streams: {
      getWeather: [collectCity, provideWeather],
      goodbye: handleGoodbye,
      greeting: handleGreeting,
      getBotInfo: [collectUserInterest, provideBotInfo],
      getBotFeedback: provideBotFeedback,
      getHumorFeedback: provideHumorFeedback,
    main: 'onboarding',
    onboarding: [sayHello],
    end: [untrained]
    },
  })
}
