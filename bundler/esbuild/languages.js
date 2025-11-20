module.exports = {
  en: {
    form: {
      messages: {
        success: '<strong>Thanks!</strong> That’s done! A reply should come through soon.',
        error: '<strong>Oh no!</strong> Sending failed! Please try again later.',
        empty: 'No results found',
        close: 'Close'
      }
    },
    modal: {
      messages: {
        loading: 'Loading...',
        error: 'Error loading content, please try again later.',
        close: 'Close (Esc)'
      }
    },
    cookieConsent: {
    consentModal: {
      title: 'Your privacy matters',
      description: 'This website uses cookies to improve the user experience, analyze traffic, and personalize content. You can choose which categories to allow. Managing your preferences is optional and can be changed at any time.',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Reject all',
      showPreferencesBtn: 'Manage preferences'
    },
    preferencesModal: {
      title: 'Cookie preferences',
      acceptAllBtn: 'Accept all',
      acceptNecessaryBtn: 'Reject all',
      savePreferencesBtn: 'Save preferences',
      closeIconLabel: 'Close',
      sections: [
        {
          title: 'Cookie usage',
          description: 'This website uses cookies to improve the user experience, analyze traffic, and personalize content. You can choose which categories to allow. Managing your preferences is optional and can be changed at any time.'
        },
        {
          title: 'Strictly necessary cookies',
          description: 'These cookies are essential for the proper functioning of the website and cannot be disabled. Without these cookies, the website would not work properly.',
          linkedCategory: 'necessary'
        },
        {
          title: 'Performance and Analytics cookies',
          description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
          linkedCategory: 'analytics',
          cookieTable: {
            headers: {
              name: 'Name',
              domain: 'Service',
              description: 'Description',
              expiration: 'Expiration'
            },
              body: [
                {
                  name: 'im_youtube',
                  domain: 'YouTube',
                  description: 'Used to remember if the user accepted the YouTube service.',
                  service: 'YouTube',
                  expiration: '6 months'
                },
                {
                  name: 'im_vimeo',
                  domain: 'Vimeo',
                  description: 'Used to remember if the user accepted the Vimeo service.',
                  service: 'Vimeo',
                  expiration: '6 months'
                },
                {
                  name: 'im_googlemaps',
                  domain: 'Google Maps',
                  description: 'Used to remember if the user accepted the Google Maps service.',
                  service: 'Google Maps',
                  expiration: '6 months'
                }
              ]
            }
          }
        ]
      }
    },
    iframeManager: {
      youtube: {
        notice: 'This content is hosted by a third party. By showing the external content you accept the <a rel="noreferrer noopener" href="https://youtube.com/t/terms" target="_blank">terms and conditions</a> of YouTube.',
        loadBtn: 'Load video',
        loadAllBtn: "Don't ask again"
      },
      vimeo: {
        notice: 'This content is hosted by a third party. By showing the external content you accept the <a rel="noreferrer noopener" href="https://vimeo.com/terms" target="_blank">terms and conditions</a> of Vimeo.',
        loadBtn: 'Load video',
        loadAllBtn: "Don't ask again"
      },
      googleMaps: {
        notice: 'This content is hosted by a third party. By showing the external content you accept the <a rel="noreferrer noopener" href="https://cloud.google.com/maps-platform/terms" target="_blank">terms and conditions</a> of Google Maps.',
        loadBtn: 'Load map',
        loadAllBtn: "Don't ask again"
      }
    }
  },
  it: {
    form: {
      messages: {
        success: '<strong>Grazie!</strong> Richiesta inviata! Riceverai una risposta quanto prima.',
        error: '<strong>Accidenti!</strong> Invio non riuscito! Riprova più tardi, per favore.',
        empty: 'Nessun risultato trovato',
        close: 'Chiudi'
      }
    },
    modal: {
      messages: {
        loading: 'Caricamento...',
        error: 'Non è stato possibile caricare il contenuto, per favore riprova più tardi.',
        close: 'Chiudi (Esc)'
      }
    },
    cookieConsent: {
      consentModal: {
        title: 'La tua privacy è importante',
        description: 'Questo sito utilizza i cookie per migliorare l’esperienza d’uso, analizzare il traffico e personalizzare i contenuti. È possibile scegliere quali categorie autorizzare. La gestione delle preferenze è opzionale e può essere modificata in qualsiasi momento.',
        acceptAllBtn: 'Accetta tutto',
        acceptNecessaryBtn: 'Rifiuta tutto',
        showPreferencesBtn: 'Gestisci preferenze'
      },
      preferencesModal: {
        title: 'Preferenze cookie',
        acceptAllBtn: 'Accetta tutto',
        acceptNecessaryBtn: 'Rifiuta tutto',
        savePreferencesBtn: 'Salva preferenze',
        closeIconLabel: 'Chiudi',
        sections: [
          {
            title: 'Uso dei cookie',
            description: 'Questo sito utilizza i cookie per migliorare l’esperienza d’uso, analizzare il traffico e personalizzare i contenuti. È possibile scegliere quali categorie autorizzare. La gestione delle preferenze è opzionale e può essere modificata in qualsiasi momento.',
          },
          {
            title: 'Cookie strettamente necessari',
            description: 'Questi cookie sono essenziali per il corretto funzionamento del sito e non possono essere disattivati. Senza questi cookie, il sito non funzionerebbe correttamente.',
            linkedCategory: 'necessary'
          },
          {
            title: 'Cookie di performance e analisi',
            description: 'Questi cookie raccolgono informazioni su come utilizzi questo sito. Tutti i dati sono anonimizzati e non possono essere utilizzati per identificarti.',
            linkedCategory: 'analytics',
            cookieTable: {
              headers: {
                name: 'Nome',
                domain: 'Servizio',
                description: 'Descrizione',
                expiration: 'Scadenza'
              },
              body: [
                {
                  name: 'im_youtube',
                  domain: 'YouTube',
                  description: 'Usato per ricordare se l’utente ha accettato il servizio YouTube.',
                  service: 'YouTube',
                  expiration: '6 mesi'
                },
                {
                  name: 'im_vimeo',
                  domain: 'Vimeo',
                  description: 'Usato per ricordare se l’utente ha accettato il servizio Vimeo.',
                  service: 'Vimeo',
                  expiration: '6 mesi'
                },
                {
                  name: 'im_googlemaps',
                  domain: 'Google Maps',
                  description: 'Usato per ricordare se l’utente ha accettato il servizio Google Maps.',
                  service: 'Google Maps',
                  expiration: '6 mesi'
                }
              ]
            }
          }
        ]
      }
    },
    iframeManager: {
      youtube: {
        notice: 'Questo contenuto è ospitato da un servizio di terze parti. Visualizzandolo accetti i <a rel="noreferrer noopener" href="https://youtube.com/t/terms" target="_blank">termini e condizioni</a> di YouTube.',
        loadBtn: 'Carica video',
        loadAllBtn: 'Non chiedere più'
      },
      vimeo: {
        notice: 'Questo contenuto è ospitato da un servizio di terze parti. Visualizzandolo accetti i <a rel="noreferrer noopener" href="https://vimeo.com/terms" target="_blank">termini e condizioni</a> di Vimeo.',
        loadBtn: 'Carica video',
        loadAllBtn: 'Non chiedere più'
      },
      googleMaps: {
        notice: 'Questo contenuto è ospitato da un servizio di terze parti. Visualizzandolo accetti i <a rel="noreferrer noopener" href="https://cloud.google.com/maps-platform/terms" target="_blank">termini e condizioni</a> di Google Maps.',
        loadBtn: 'Carica mappa',
        loadAllBtn: "Non chiedere più"
      }
    }
  }
}
