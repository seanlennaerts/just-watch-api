const functions = require('firebase-functions');
const JustWatch = require('justwatch-api');

exports.getProviders = functions.https.onRequest((request, response) => {
  const jw = new JustWatch({ locale: 'en_CA' });
  const shows = request.body;
  const promises = [];
  for (const show of shows) {
    promises.push(new Promise((resolve, reject) => {
      jw.search({ query: show.title }).then((data) => {
        loop:
        for (const offer of data.items[0].offers) {
          if (offer.monetization_type === 'flatrate') {
            // in order of preference
            switch (offer.provider_id) {
              case 8:
                show.provider = 'Netflix';
                break loop;
              case 119:
                show.provider = 'Prime Video';
                break loop;
              case 337:
                show.provider = 'Disney+';
                break loop;
              case 231:
                show.provider = 'Crave+';
                break loop;
              default:
              //
            }
          }
        }
        if (!show.provider) {
          show.provider = 'other';
        }
        resolve(show);
      }).catch((err) => {
        show.provider = 'error';
        resolve(show);
      });
    }));
  }

  Promise.all(promises).then((values) => {
    console.log(values);
    response.send(JSON.stringify(values));
  }).catch((err) => {
    response.status(500).send('Failed to get providers');
  });
});