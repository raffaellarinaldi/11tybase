const sharedStrings = {
    en: {
        policies: {
            privacy: 'Privacy Policy',
            cookie: 'Cookie Policy',
            consent: 'Manage Consent'
        },
        entry: {
            tags: 'Tags'
        }
    },
    it: {
        policies: {
            privacy: 'Informativa sulla Privacy',
            cookie: 'Informativa sui Cookies',
            consent: 'Gestione Consenso'
        },
        entry: {
            tags: 'Etichette'
        }
    }
}

module.exports = {
    en: {
        meta: {
            name: 'English',
            locale: 'en_US',
            dir: 'ltr',
            charset: 'utf-8'
        },
        pagination: {
            prev: 'Previous',
            next: 'Next',
            slug: 'page'
        },
        form: {
            labels: {
                honeypot: 'Don’t fill this out if you’re human:',
                name: 'Name',
                email: 'Email',
                subject: 'Subject',
                message: 'Message',
                search: 'Search',
                select: 'Select an option',
                send: 'Send',
                cancel: 'Cancel',
                privacy: 'I have read and agree to the',
                terms: 'I have read and agree to the'
            },
            messages: {
                success: 'Message sent successfully!',
                error: 'An error occurred. Please try again.',
                close: 'Close'
            }
        },
        entry: {
            meta: {
                date: 'Published on',
                author: 'Published by',
                tags: sharedStrings.en.entry.tags
            },
            featured: 'Featured',
            share: ['Share', 'on']
        },
        archive: {
            actions: {
                readMore: 'Read more',
                loadMore: 'Load more'
            }
        },
        widgets: {
            recent: 'Recent entries',
            categories: 'Categories',
            tags: sharedStrings.en.entry.tags
        },
        taxonomies: {
            all: 'All'
        },
        resume: {
            timeline: {
                from: 'from',
                to: 'to',
                present: 'present'
            },
            experience: {
                levels: ['Expert', 'Advanced', 'Intermediate', 'Beginner', 'Novice'],
                years: ['year', 'years', 'less than', 'more than']
            }
        },
        portfolio: {
            client: 'client'
        },
        policies: {
            privacy: {
                title: sharedStrings.en.policies.privacy,
                buttons: {
                    accept: 'Accept',
                    reject: 'Reject',
                    preferences: 'Preferences'
                }
            },
            cookie: {
                title: sharedStrings.en.policies.cookie
            },
            consent: {
                title: sharedStrings.en.policies.consent
            }
        },
        footer: {
            rights: {
                all: 'All rights reserved',
                some: 'Some rights reserved'
            },
            consent: sharedStrings.en.policies.consent,
            createdBy: 'Created by'
        },
        aria: {
            navigation: {
                label: 'Toggle navigation',
                title: 'Menu',
                current: 'current'
            },
            modal: {
                close: 'Close'
            }
        }
    },
    it: {
        meta: {
            name: 'Italiano',
            locale: 'it_IT',
            dir: 'ltr',
            charset: 'utf-8'
        },
        pagination: {
            prev: 'Precedente',
            next: 'Successivo',
            slug: 'pagina'
        },
        form: {
            labels: {
                honeypot: 'Non compilarlo se sei un essere umano:',
                name: 'Nome',
                email: 'Email',
                subject: 'Oggetto',
                message: 'Messaggio',
                search: 'Cerca',
                select: 'Seleziona un’opzione',
                send: 'Invia',
                cancel: 'Cancella',
                privacy: 'Ho letto e accetto l’',
                terms: 'Ho letto e accetto i'
            },
            messages: {
                success: 'Messaggio inviato con successo!',
                error: 'Si è verificato un errore. Riprova più tardi.',
                close: 'Chiudi'
            }
        },
        entry: {
            meta: {
                date: 'Pubblicato in data',
                author: 'Pubblicato da',
                tags: sharedStrings.it.entry.tags
            },
            featured: 'In Evidenza',
            share: ['Condividi', 'su']
        },
        archive: {
            actions: {
                readMore: 'Leggi tutto',
                loadMore: 'Mostra altro'
            }
        },
        widgets: {
            recent: 'Ultimi articoli',
            categories: 'Categorie',
            tags: sharedStrings.it.entry.tags
        },
        taxonomies: {
            all: 'Tutto'
        },
        resume: {
            timeline: {
                from: 'da',
                to: 'a',
                present: 'presente'
            },
            experience: {
                levels: ['Esperto', 'Avanzato', 'Intermedio', 'Principiante', 'Novizio'],
                years: ['anno', 'anni', 'meno di', 'più di']
            }
        },
        portfolio: {
            client: 'cliente'
        },
        policies: {
            privacy: {
                title: sharedStrings.it.policies.privacy,
                buttons: {
                    accept: 'Accetta',
                    reject: 'Rifiuta',
                    preferences: 'Preferenze'
                }
            },
            cookie: {
                title: sharedStrings.it.policies.cookie
            },
            consent: {
                title: sharedStrings.it.policies.consent
            }
        },
        footer: {
            rights: {
                all: 'Tutti i diritti riservati',
                some: 'Alcuni diritti riservati'
            },
            consent: sharedStrings.it.policies.consent,
            createdBy: 'Realizzato da'
        },
        aria: {
            navigation: {
                label: 'Mostra/nascondi navigazione',
                title: 'Menu',
                current: 'corrente'
            },
            modal: {
                close: 'Chiudi'
            }
        }
    }
}
