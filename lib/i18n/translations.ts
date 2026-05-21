export type Lang = "nb" | "en";

export const SUPPORTED_LANGS: Lang[] = ["nb", "en"];

type TranslationDict = {
  common: {
    login: string;
    signupCta: string;
    requestAccess: string;
    contact: string;
    or: string;
    loading: string;
    next: string;
  };
  auth: {
    loginTab: string;
    signupTab: string;
    terms: string;
    privacy: string;
    footerCopyright: string;
  };
  legal: {
    back: string;
    backToHome: string;
    backToDashboard: string;
  };
  landing: {
    topbarLogin: string;
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    previewLabel: string;
    previewClient: string;
    previewKpiViews: string;
    previewKpiGrowth: string;
    previewKpiLikes: string;
    previewKpiVideos: string;
    previewTableDate: string;
    previewTableTitle: string;
    previewTableTotal: string;
    previewVideo1: string;
    previewVideo2: string;
    previewVideo3: string;
    previewVideo4: string;
    platformsHeading: string;
    platformsCaption: string;
    featuresEyebrow: string;
    featuresHeading: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
    stepsEyebrow: string;
    stepsHeading: string;
    stepsIntro: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    audienceHeading: string;
    audienceP1: string;
    audienceP2: string;
    audienceP3: string;
    finalHeading: string;
    finalDesc: string;
    finalCta: string;
  };
  login: {
    haveNoAccount: string;
    createAccount: string;
    welcomeEyebrow: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    forgotPassword: string;
    submit: string;
    submitting: string;
    errorInvalid: string;
    newToGjensvar: string;
    legalAgree: string;
  };
  signup: {
    haveAccount: string;
    loginLink: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    firstNameLabel: string;
    firstNamePlaceholder: string;
    lastNameLabel: string;
    lastNamePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    passwordHint: string;
    passwordWeak: string;
    passwordOk: string;
    passwordStrong: string;
    acceptTermsBefore: string;
    acceptTermsLinkTerms: string;
    acceptTermsAnd: string;
    acceptTermsLinkPrivacy: string;
    submit: string;
    submitting: string;
    errorPasswordShort: string;
    errorTermsRequired: string;
    successTitle: string;
    successDesc: string;
    successLogin: string;
    alreadyMember: string;
  };
  forgotPassword: {
    rememberQuestion: string;
    loginLink: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    errorGeneric: string;
    successHeading: string;
    successDescBefore: string;
    successDescAfter: string;
    backToLogin: string;
  };
  resetPassword: {
    eyebrow: string;
    title: string;
    subtitle: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmLabel: string;
    confirmPlaceholder: string;
    passwordHint: string;
    submit: string;
    submitting: string;
    errorTooShort: string;
    errorMismatch: string;
    errorGeneric: string;
    backToLogin: string;
  };
  setupPassword: {
    eyebrow: string;
    title: string;
    subtitle: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmLabel: string;
    confirmPlaceholder: string;
    passwordHint: string;
    submit: string;
    submitting: string;
    errorTooShort: string;
    errorMismatch: string;
    errorGeneric: string;
  };
  dashboard: {
    logout: string;
    menu: string;
    adminApprovedEmails: string;
    sync: string;
    syncing: string;
    syncDataTitle: string;
    syncDoneTitle: string;
    syncWaiting: string;
    syncStarting: string;
    syncWorking: string;
    syncProgress: string;
    syncNoData: string;
    syncNotConnected: string;
    syncFailed: string;
    syncStreamEmpty: string;
    syncErrorPrefix: string;
    syncEmptyError: string;
    syncUnknownError: string;
    close: string;
    selectClient: string;
    clients: string;
    noClients: string;
    createNewClient: string;
    create: string;
    creating: string;
    clientNamePlaceholder: string;
    deleteClient: string;
    deleteClientWarn: string;
    cancel: string;
    delete: string;
    deleting: string;
    renameClient: string;
    rename: string;
    renaming: string;
    saveChanges: string;
    platforms: string;
    connectPlatform: string;
    switchAccount: string;
    disconnect: string;
    comingSoon: string;
    snapchatManual: string;
    snapchatManualNoCount: string;
    snapchatManualWithCount: string;
    snapchatManualWithCountSingular: string;
    manage: string;
    snapchatModalTitle: string;
    snapchatModalSubtitle: string;
    snapchatModalAdd: string;
    snapchatModalEmpty: string;
    snapchatModalLoading: string;
    snapchatModalLoadingError: string;
    snapchatModalDelete: string;
    snapchatModalEdit: string;
    snapchatCaptionLabel: string;
    snapchatCaptionPlaceholder: string;
    snapchatPostedAtLabel: string;
    snapchatViewsLabel: string;
    snapchatScreenshotsLabel: string;
    snapchatSharesLabel: string;
    snapchatPermalinkLabel: string;
    snapchatPermalinkPlaceholder: string;
    snapchatSavingError: string;
    snapchatRequiredField: string;
    snapchatInvalidNumber: string;
    snapchatInlineHover: string;
    snapchatInlineSave: string;
    snapchatInlineCancel: string;
    welcome: string;
    welcomeSubtitle: string;
    overviewSubtitle: string;
    overviewSubtitleClient: string;
    notSynced: string;
    period: string;
    year: string;
    month: string;
    week: string;
    selectMonth: string;
    selectWeek: string;
    selectYear: string;
    weekShort: string;
    monthly: string;
    weekly: string;
    tabVideos: string;
    tabViews: string;
    tabPosts: string;
    tabAnalytics: string;
    export: string;
    exportCsv: string;
    exportCsvDesc: string;
    exportPdf: string;
    exportPdfDesc: string;
    exportBrandLabel: string;
    exportBrandPlaceholder: string;
    exportBrandHint: string;
    exportBrandSaving: string;
    exportYearReport: string;
    exportYearReportDesc: string;
    exportMonthReport: string;
    exportMonthReportDesc: string;
    exportWeekReport: string;
    exportWeekReportDesc: string;
    download: string;
    kpiTotalViews: string;
    kpiGrowth: string;
    kpiBestVideo: string;
    kpiEngagement: string;
    kpiTotalLikes: string;
    kpiTotalPosts: string;
    comparedTo: string;
    noPreviousData: string;
    noBestVideo: string;
    tableDate: string;
    tableTitle: string;
    tableTags: string;
    tableTotal: string;
    tableTotalLower: string;
    tableLikes: string;
    tableMonth: string;
    tableWeek: string;
    noDataYet: string;
    noVideosYet: string;
    loadingAnalytics: string;
    viewsCaptionVideos: string;
    viewsCaptionMonthly: string;
    viewsCaptionWeekly: string;
    viewsCaptionPosts: string;
    rowMerge: string;
    rowMergeTooltip: string;
    rowMergeWith: string;
    rowMergeNoCandidates: string;
    rowMergeConfirm: string;
    rowMergeMerging: string;
    rowSeparate: string;
    rowSeparateTooltip: string;
    rowSeparating: string;
    rowMoreActions: string;
    rowEditDate: string;
    rowEditTitle: string;
    rowSaveDate: string;
    rowDeletePlatform: string;
    rowHideRow: string;
    rowHidden: string;
    rowDateOverridden: string;
    rowOpenOn: string;
    rowResetDate: string;
    hiddenVideosTitle: string;
    hiddenVideosSubtitle: string;
    hiddenVideosEmpty: string;
    hiddenVideosUnhide: string;
    hiddenVideosCount: string;
    hiddenVideosCountSingular: string;
    titleEditPlaceholder: string;
    titleEditSave: string;
    titleEditCancel: string;
    categoryAdd: string;
    categoryNew: string;
    categoryPlaceholder: string;
    categoryRemove: string;
    categoryRename: string;
    onboardingTitle: string;
    onboardingDesc: string;
    onboardingButton: string;
    onboardingPlaceholder: string;
    onboardingCreating: string;
    statusBannerSyncing: string;
    statusBannerSynced: string;
    statusBannerError: string;
    sidebarOverview: string;
    sidebarSettings: string;
    sidebarBack: string;
    monthJan: string;
    monthFeb: string;
    monthMar: string;
    monthApr: string;
    monthMay: string;
    monthJun: string;
    monthJul: string;
    monthAug: string;
    monthSep: string;
    monthOct: string;
    monthNov: string;
    monthDec: string;
    monthShortJan: string;
    monthShortFeb: string;
    monthShortMar: string;
    monthShortApr: string;
    monthShortMay: string;
    monthShortJun: string;
    monthShortJul: string;
    monthShortAug: string;
    monthShortSep: string;
    monthShortOct: string;
    monthShortNov: string;
    monthShortDec: string;
    analyticsTitle: string;
    analyticsViewsOverTime: string;
    analyticsViewsOverTimeSub: string;
    analyticsTopVideos: string;
    analyticsTopVideosSub: string;
    analyticsByPlatform: string;
    analyticsByPlatformSub: string;
    analyticsCategoryMix: string;
    analyticsNoVideos: string;
    analyticsViews: string;
    analyticsLikes: string;
    analyticsComments: string;
    analyticsShares: string;
    analyticsViewsPerMonth: string;
    analyticsViewsPerMonthSub: string;
    analyticsPostsVsViews: string;
    analyticsPostsVsViewsSub: string;
    analyticsAvgViews: string;
    analyticsAvgViewsSub: string;
    analyticsTotalLabel: string;
    analyticsPostsLabel: string;
    analyticsTotalViews: string;
    of: string;
    noTitle: string;
    bannerErrorMetaAuthFailed: string;
    bannerErrorConfig: string;
    bannerErrorNotAuthenticated: string;
    bannerErrorNoClientSelected: string;
    bannerErrorStateMismatch: string;
    bannerErrorTokenExchangeFailed: string;
    bannerErrorLongLivedTokenFailed: string;
    bannerErrorNoPagesFound: string;
    bannerErrorNoIgBusinessAccount: string;
    bannerErrorDb: string;
    bannerErrorUnexpected: string;
    bannerErrorNoClient: string;
    bannerErrorPrefix: string;
    bannerSuccessInstagram: string;
    bannerSuccessFacebook: string;
    bannerSuccessTiktok: string;
    bannerSuccessYoutube: string;
    adminBack: string;
    adminTitle: string;
    adminSubtitle: string;
    adminEmailPlaceholder: string;
    adminAdd: string;
    adminAdding: string;
    adminLoading: string;
    adminEmpty: string;
    adminAddedAt: string;
    adminRemove: string;
    adminRemoving: string;
    adminFetchError: string;
  };
};

export const translations: Record<Lang, TranslationDict> = {
  nb: {
    common: {
      login: "Logg inn",
      signupCta: "Opprett konto",
      requestAccess: "Be om tilgang",
      contact: "Kontakt",
      or: "eller",
      loading: "Laster…",
      next: "Neste",
    },
    auth: {
      loginTab: "Logg inn",
      signupTab: "Opprett konto",
      terms: "Vilkår",
      privacy: "Personvern",
      footerCopyright: "Gjensvar utviklet av {company}",
    },
    legal: {
      back: "Tilbake",
      backToHome: "Tilbake til forsiden",
      backToDashboard: "Tilbake til dashbordet",
    },
    landing: {
      topbarLogin: "Logg inn",
      badge: "Begrenset tilgang — kun for godkjente norske markedsføringsbyråer",
      title: "All videoinnsikten kundene dine etterspør, samlet i ett dashbord",
      subtitle:
        "Gjensvar henter automatisk inn visninger, likes og kommentarer fra TikTok, Instagram, YouTube og Facebook, og presenterer det som én ren oversikt per kunde. Bygget for markedsføringsbyråer som heller vil bruke tiden på innholdet enn å samle tall fra fem ulike plattformer hver måned.",
      ctaPrimary: "Logg inn",
      ctaSecondary: "Be om tilgang",
      previewLabel: "Et raskt blikk i dashbordet",
      previewClient: "Bedrift AS",
      previewKpiViews: "Totale visninger",
      previewKpiGrowth: "Vekst",
      previewKpiLikes: "Likes",
      previewKpiVideos: "Videoer",
      previewTableDate: "Dato",
      previewTableTitle: "Tittel",
      previewTableTotal: "Sum",
      previewVideo1: "Vårkampanje 2026",
      previewVideo2: "Bak kulissene",
      previewVideo3: "Produktlansering",
      previewVideo4: "Kundeintervju",
      platformsHeading: "Plattformer som støttes",
      platformsCaption:
        "TikTok, Instagram, YouTube og Facebook synkroniseres automatisk. Snapchat-tall legges inn manuelt.",
      featuresEyebrow: "Funksjoner",
      featuresHeading: "Alt byrået trenger på ett sted",
      feature1Title: "Samlet visningstall",
      feature1Desc:
        "Se hvor mange ganger en video er sett totalt — på tvers av alle plattformer den ble lagt ut på. Gjensvar grupperer videoer som er lagt ut samme dag automatisk.",
      feature2Title: "Automatisk oppdatering",
      feature2Desc:
        "Koble til kundens kontoer én gang, så henter Gjensvar inn nye videoer og oppdaterte tall hver gang du åpner dashbordet.",
      feature3Title: "Én bruker, mange kunder",
      feature3Desc:
        "Bytt mellom kundene dine i dashbordet. Hver kunde har sine egne kontoer, sine egne tall og sin egen rapport — fullstendig separat.",
      feature4Title: "Ferdige PDF-rapporter",
      feature4Desc:
        "Last ned ferdig stylede rapporter direkte fra dashbordet. Send dem videre til kunden uten å redigere et eneste tall.",
      stepsEyebrow: "Slik fungerer det",
      stepsHeading: "Fra tilgang til ferdig rapport",
      stepsIntro:
        "Gjensvar er laget slik at det meste skjer av seg selv. Du kobler til kontoene én gang, og bruker resten av tiden på det viktigste — å lage innhold for kundene dine.",
      step1Title: "Søk om tilgang",
      step1Desc:
        "Send oss en kort e-post om byrået ditt. Vi godkjenner manuelt for å holde tjenesten trygg, og gir beskjed når kontoen er klar.",
      step2Title: "Legg inn kundene dine",
      step2Desc:
        "Opprett en kunde for hver bedrift dere lager innhold for, og koble til deres TikTok, Instagram, YouTube og Facebook gjennom de offisielle innloggingene.",
      step3Title: "La Gjensvar gjøre jobben",
      step3Desc:
        "Hver gang en video legges ut, hentes tallene automatisk. Du ser visninger, likes og kommentarer for hver plattform, og en samlet sum for hver video.",
      step4Title: "Lever til kunden",
      step4Desc:
        "Eksporter en ferdig rapport når kunden vil ha oppsummering. Velg periode, last ned PDF-en, og send den videre.",
      audienceHeading: "Hvem er Gjensvar for?",
      audienceP1:
        "Gjensvar er bygget spesifikt for markedsføringsbyråer som produserer videoinnhold for andre bedrifter — ikke for merkevarer som drifter sine egne kontoer.",
      audienceP2:
        "Hvis du er et byrå som filmer, redigerer og publiserer på vegne av kundene dine, så vet du hvor tungvint det er å samle tall fra fem forskjellige plattformer hver måned. Gjensvar fjerner det manuelle arbeidet og lar deg fokusere på selve innholdet.",
      audienceP3:
        "Tilgang er begrenset til godkjente byråer. Send oss en kort e-post med navnet på byrået og hvilke kunder dere jobber med, så tar vi kontakt.",
      finalHeading: "Allerede whitelistet?",
      finalDesc:
        "Logg inn for å se kundenes videostatistikk på tvers av plattformer.",
      finalCta: "Logg inn på Gjensvar",
    },
    login: {
      haveNoAccount: "Har du ikke konto?",
      createAccount: "Opprett konto",
      welcomeEyebrow: "Velkommen tilbake",
      title: "Logg inn på Gjensvar",
      subtitle:
        "Samlet oversikt over innhold og engasjement på tvers av plattformer.",
      emailLabel: "E-post",
      emailPlaceholder: "navn@firma.no",
      passwordLabel: "Passord",
      forgotPassword: "Glemt passord?",
      submit: "Logg inn",
      submitting: "Logger inn…",
      errorInvalid: "Feil e-post eller passord. Prøv igjen.",
      newToGjensvar: "Ny på Gjensvar?",
      legalAgree: "Ved å logge inn godtar du våre {terms} og {privacy}.",
    },
    signup: {
      haveAccount: "Har du allerede konto?",
      loginLink: "Logg inn",
      eyebrow: "Kom i gang",
      title: "Opprett konto",
      subtitle:
        "Tilgang krever at e-postadressen din er godkjent av en administrator.",
      firstNameLabel: "Fornavn",
      firstNamePlaceholder: "Ola",
      lastNameLabel: "Etternavn",
      lastNamePlaceholder: "Nordmann",
      companyLabel: "Bedrift",
      companyPlaceholder: "Firmanavn AS",
      emailLabel: "E-post",
      emailPlaceholder: "navn@firma.no",
      passwordLabel: "Passord",
      passwordPlaceholder: "Minst 10 tegn",
      passwordHint: "Bruk minst 10 tegn med en blanding av store og små bokstaver, tall og symboler.",
      passwordWeak: "Svakt passord",
      passwordOk: "Greit passord",
      passwordStrong: "Sterkt passord",
      acceptTermsBefore: "Jeg godtar ",
      acceptTermsLinkTerms: "vilkårene",
      acceptTermsAnd: " og ",
      acceptTermsLinkPrivacy: "personvernerklæringen",
      submit: "Opprett konto",
      submitting: "Oppretter…",
      errorPasswordShort: "Passordet må være minst 10 tegn.",
      errorTermsRequired: "Du må godta vilkårene for å fortsette.",
      successTitle: "Konto opprettet",
      successDesc:
        "Du kan nå logge inn med e-postadressen og passordet ditt.",
      successLogin: "Gå til innlogging",
      alreadyMember: "Har du allerede konto?",
    },
    forgotPassword: {
      rememberQuestion: "Husker du passordet?",
      loginLink: "Logg inn",
      eyebrow: "Tilbakestill passord",
      title: "Glemt passord?",
      subtitle:
        "Skriv inn e-postadressen din, så sender vi en lenke for å tilbakestille passordet.",
      emailLabel: "E-post",
      emailPlaceholder: "navn@firma.no",
      submit: "Send tilbakestillingslenke",
      submitting: "Sender…",
      errorGeneric: "Kunne ikke sende tilbakestillingslenke. Prøv igjen.",
      successHeading: "Sjekk innboksen din",
      successDescBefore: "Vi har sendt en tilbakestillingslenke til ",
      successDescAfter:
        ". Klikk på lenken i e-posten for å fullføre tilbakestillingen.",
      backToLogin: "Tilbake til innlogging",
    },
    resetPassword: {
      eyebrow: "Nytt passord",
      title: "Velg et nytt passord",
      subtitle:
        "Sett et passord du kan huske, og som er trygt å bruke for kontoen din.",
      passwordLabel: "Nytt passord",
      passwordPlaceholder: "Minst 8 tegn",
      confirmLabel: "Bekreft passord",
      confirmPlaceholder: "Gjenta passordet",
      passwordHint: "Bruk minst 8 tegn. Mer enn 12 tegn anbefales.",
      submit: "Oppdater passord",
      submitting: "Lagrer…",
      errorTooShort: "Passordet må være minst 8 tegn.",
      errorMismatch: "Passordene er ikke like.",
      errorGeneric:
        "Kunne ikke oppdatere passord. Lenken kan ha utløpt — be om en ny.",
      backToLogin: "Tilbake til innlogging",
    },
    setupPassword: {
      eyebrow: "Velkommen til Gjensvar",
      title: "Sett opp kontoen din",
      subtitle:
        "Velg et passord for kontoen din, så er du klar til å bruke Gjensvar.",
      passwordLabel: "Passord",
      passwordPlaceholder: "Minst 8 tegn",
      confirmLabel: "Bekreft passord",
      confirmPlaceholder: "Gjenta passordet",
      passwordHint: "Bruk minst 8 tegn. Mer enn 12 tegn anbefales.",
      submit: "Sett passord og logg inn",
      submitting: "Lagrer…",
      errorTooShort: "Passordet må være minst 8 tegn.",
      errorMismatch: "Passordene er ikke like.",
      errorGeneric: "Kunne ikke sette passord. Prøv igjen.",
    },
    dashboard: {
      logout: "Logg ut",
      menu: "Meny",
      adminApprovedEmails: "Godkjente e-poster",
      sync: "Synkroniser",
      syncing: "Synkroniserer…",
      syncDataTitle: "Synkroniserer data",
      syncDoneTitle: "Synkronisering ferdig",
      syncWaiting: "Venter…",
      syncStarting: "Starter…",
      syncWorking: "Jobber…",
      syncProgress: "{current} av {total}",
      syncNoData: "Ingen data",
      syncNotConnected: "Ikke koblet til",
      syncFailed: "Feilet",
      syncStreamEmpty: "Streamen er tom.",
      syncErrorPrefix: "Feil: {status}",
      syncEmptyError: "Kunne ikke parse event:",
      syncUnknownError: "Ukjent feil",
      close: "Lukk",
      selectClient: "Velg kunde",
      clients: "Kunder",
      noClients: "Ingen kunder ennå",
      createNewClient: "Opprett ny kunde",
      create: "Opprett",
      creating: "Oppretter…",
      clientNamePlaceholder: "Kundenavn",
      deleteClient: "Slett kunde",
      deleteClientWarn:
        "All data tilknyttet denne kunden vil bli slettet permanent. Skriv {name} for å bekrefte.",
      cancel: "Avbryt",
      delete: "Slett",
      deleting: "Sletter…",
      renameClient: "Endre kundenavn",
      rename: "Endre navn",
      renaming: "Lagrer…",
      saveChanges: "Lagre",
      platforms: "Plattformer",
      connectPlatform: "Koble til {platform}",
      switchAccount: "Bytt konto",
      disconnect: "Koble fra",
      comingSoon: "Kommer snart",
      snapchatManual: "Snapchat",
      snapchatManualNoCount: "Legg inn tall manuelt",
      snapchatManualWithCount: "{count} manuelle poster",
      snapchatManualWithCountSingular: "{count} manuell post",
      manage: "Administrer",
      snapchatModalTitle: "Snapchat — manuelle tall",
      snapchatModalSubtitle:
        "Snapchat har ingen API for analytics, så tallene må legges inn manuelt. Postene vises i dashbordet på samme måte som data fra andre plattformer.",
      snapchatModalAdd: "Legg til post",
      snapchatModalEmpty: "Ingen manuelle Snapchat-poster ennå.",
      snapchatModalLoading: "Henter…",
      snapchatModalLoadingError: "Kunne ikke hente poster.",
      snapchatModalDelete: "Slett",
      snapchatModalEdit: "Rediger",
      snapchatCaptionLabel: "Tittel / beskrivelse",
      snapchatCaptionPlaceholder: "Valgfri kort tekst",
      snapchatPostedAtLabel: "Dato",
      snapchatViewsLabel: "Visninger",
      snapchatScreenshotsLabel: "Skjermbilder",
      snapchatSharesLabel: "Delinger",
      snapchatPermalinkLabel: "Lenke",
      snapchatPermalinkPlaceholder: "https://www.snapchat.com/…",
      snapchatSavingError: "Kunne ikke lagre. Prøv igjen.",
      snapchatRequiredField: "Påkrevd",
      snapchatInvalidNumber: "Ugyldig tall",
      snapchatInlineHover: "Klikk for å legge inn Snapchat-visninger",
      snapchatInlineSave: "Lagre",
      snapchatInlineCancel: "Avbryt",
      welcome: "Ditt dashbord",
      welcomeSubtitle: "her er ditt",
      overviewSubtitle:
        "Samlet oversikt over innhold, visninger og engasjement på tvers av plattformer.",
      overviewSubtitleClient:
        "Samlet oversikt for {client} på tvers av plattformer.",
      notSynced: "Ikke synkronisert ennå",
      period: "Periode",
      year: "År",
      month: "Måned",
      week: "Uke",
      selectMonth: "Velg måned",
      selectWeek: "Velg uke",
      selectYear: "Velg år",
      weekShort: "Uke {n}",
      monthly: "Månedlig",
      weekly: "Ukentlig",
      tabVideos: "Videoer",
      tabViews: "Visninger",
      tabPosts: "Innlegg",
      tabAnalytics: "Analyse",
      export: "Eksporter",
      exportCsv: "Last ned CSV",
      exportCsvDesc: "Rådata for valgt fane",
      exportPdf: "Last ned PDF",
      exportPdfDesc: "Klar til kunden",
      exportBrandLabel: "Merkenavn på rapport",
      exportBrandPlaceholder: "F.eks. Bedrift AS",
      exportBrandHint: "Vises øverst i alle PDF-eksporter for denne kunden.",
      exportBrandSaving: "Lagrer…",
      exportYearReport: "Årsrapport",
      exportYearReportDesc: "Helårsrapport med diagrammer",
      exportMonthReport: "Månedsrapport",
      exportMonthReportDesc: "Periodebasert kunderapport",
      exportWeekReport: "Ukerapport",
      exportWeekReportDesc: "Ukentlig oppsummering",
      download: "Last ned",
      kpiTotalViews: "Totale visninger",
      kpiGrowth: "Vekst",
      kpiBestVideo: "Beste video",
      kpiEngagement: "Engasjement",
      kpiTotalLikes: "Totale likes",
      kpiTotalPosts: "Antall poster",
      comparedTo: "vs. {value} samme periode i fjor",
      noPreviousData: "Ingen sammenligningsdata",
      noBestVideo: "Ingen videoer enda",
      tableDate: "Dato",
      tableTitle: "Tittel",
      tableTags: "Tags",
      tableTotal: "Total",
      tableTotalLower: "Totalt",
      tableLikes: "Likes",
      tableMonth: "Måned",
      tableWeek: "Uke",
      noDataYet: "Ingen videoer synkronisert enda.",
      noVideosYet: "Ingen videoer ennå.",
      loadingAnalytics: "Laster analyse…",
      viewsCaptionVideos:
        "Visninger per video fordelt på plattform i {period}.",
      viewsCaptionMonthly: "Totale visninger per måned i {period}.",
      viewsCaptionWeekly: "Totale visninger per uke i {period}.",
      viewsCaptionPosts: "Antall innlegg per plattform per måned i {period}.",
      rowMerge: "Slå sammen",
      rowMergeTooltip: "Slå sammen denne raden med en annen",
      rowMergeWith: "Slå sammen med:",
      rowMergeNoCandidates: "Ingen andre rader å slå sammen med.",
      rowMergeConfirm: "Slå sammen",
      rowMergeMerging: "Slår sammen…",
      rowSeparate: "Skill ut",
      rowSeparateTooltip: "Skill denne videoen ut til en egen rad",
      rowSeparating: "Skiller ut…",
      rowMoreActions: "Flere handlinger",
      rowEditDate: "Endre dato",
      rowEditTitle: "Endre tittel",
      rowSaveDate: "Lagre",
      rowDeletePlatform: "Skjul fra denne plattformen",
      rowHideRow: "Skjul hele raden",
      rowHidden: "Skjult",
      rowDateOverridden: "Dato satt manuelt",
      rowOpenOn: "Åpne på {platform}",
      rowResetDate: "Tilbakestill dato",
      hiddenVideosTitle: "Skjulte videoer",
      hiddenVideosSubtitle:
        "Videoer du har skjult fra dashbordet. Du kan vise dem igjen når som helst.",
      hiddenVideosEmpty: "Ingen skjulte videoer.",
      hiddenVideosUnhide: "Vis igjen",
      hiddenVideosCount: "{count} skjulte videoer",
      hiddenVideosCountSingular: "{count} skjult video",
      titleEditPlaceholder: "Skriv inn tittel",
      titleEditSave: "Lagre",
      titleEditCancel: "Avbryt",
      categoryAdd: "Legg til tag",
      categoryNew: "Ny tag",
      categoryPlaceholder: "Tag-navn",
      categoryRemove: "Fjern tag",
      categoryRename: "Endre tag-navn",
      onboardingTitle: "Opprett din første kunde",
      onboardingDesc:
        "Hver kunde har sine egne tilkoblede plattformer og separate data. Lag én for hvert byrå-prosjekt du jobber med.",
      onboardingButton: "Opprett kunde",
      onboardingPlaceholder: "F.eks. Bedrift AS",
      onboardingCreating: "Oppretter…",
      statusBannerSyncing: "Synkroniserer plattformene…",
      statusBannerSynced: "Data oppdatert nå",
      statusBannerError: "Noe gikk galt under synkronisering",
      sidebarOverview: "Oversikt",
      sidebarSettings: "Innstillinger",
      sidebarBack: "Tilbake til dashboard",
      monthJan: "Januar",
      monthFeb: "Februar",
      monthMar: "Mars",
      monthApr: "April",
      monthMay: "Mai",
      monthJun: "Juni",
      monthJul: "Juli",
      monthAug: "August",
      monthSep: "September",
      monthOct: "Oktober",
      monthNov: "November",
      monthDec: "Desember",
      monthShortJan: "Jan",
      monthShortFeb: "Feb",
      monthShortMar: "Mar",
      monthShortApr: "Apr",
      monthShortMay: "Mai",
      monthShortJun: "Jun",
      monthShortJul: "Jul",
      monthShortAug: "Aug",
      monthShortSep: "Sep",
      monthShortOct: "Okt",
      monthShortNov: "Nov",
      monthShortDec: "Des",
      analyticsTitle: "Analyse",
      analyticsViewsOverTime: "Visninger over tid",
      analyticsViewsOverTimeSub: "Månedlig utvikling per plattform i {year}",
      analyticsTopVideos: "Topp 10 videoer",
      analyticsTopVideosSub: "Videoer med flest visninger i {year}",
      analyticsByPlatform: "Plattformfordeling",
      analyticsByPlatformSub: "Andel visninger per plattform i {year}",
      analyticsCategoryMix: "Innholdsmiks",
      analyticsNoVideos: "Ingen videoer for dette året.",
      analyticsViews: "Visninger",
      analyticsLikes: "Likes",
      analyticsComments: "Kommentarer",
      analyticsShares: "Delinger",
      analyticsViewsPerMonth: "Visninger per måned",
      analyticsViewsPerMonthSub: "Stacked fordeling per plattform i {year}",
      analyticsPostsVsViews: "Poster vs. visninger",
      analyticsPostsVsViewsSub: "Sammenheng mellom postfrekvens og visninger i {year}",
      analyticsAvgViews: "Snittvisninger",
      analyticsAvgViewsSub: "Gjennomsnittlig visninger per publisering i {year}",
      analyticsTotalLabel: "Totalt",
      analyticsPostsLabel: "Poster",
      analyticsTotalViews: "Totale visninger",
      of: "av",
      noTitle: "Uten tittel",
      bannerErrorMetaAuthFailed:
        "Tilkobling avbrutt. Du må godkjenne Gjensvar-appen for å koble til Facebook eller Instagram.",
      bannerErrorConfig:
        "Konfigurasjonsfeil i serveren. Kontakt support hvis dette fortsetter.",
      bannerErrorNotAuthenticated: "Du må logge inn på nytt for å koble til kontoer.",
      bannerErrorNoClientSelected: "Velg en aktiv kunde i topbaren før du kobler til en konto.",
      bannerErrorStateMismatch: "Sikkerhetstoken stemte ikke. Prøv å koble til på nytt fra dashboardet.",
      bannerErrorTokenExchangeFailed: "Klarte ikke å hente tilgangstoken fra Meta. Prøv igjen om litt.",
      bannerErrorLongLivedTokenFailed: "Klarte ikke å oppgradere Meta-tokenet til langtidsversjon. Prøv igjen.",
      bannerErrorNoPagesFound:
        "Ingen Facebook-sider funnet. Pass på at du (1) huker av minst én side i Meta sin tilgangsdialog, og (2) er admin på en Facebook-side. Klikk \"Rediger tilgang\" hvis Meta hopper over sidevalget.",
      bannerErrorNoIgBusinessAccount:
        "Ingen Instagram Business/Creator-konto funnet. Instagram-kontoen må være Professional og koblet til en Facebook-side du administrerer.",
      bannerErrorDb: "Databasen kunne ikke lagre tilkoblingen. Prøv igjen.",
      bannerErrorUnexpected: "Noe uventet skjedde under tilkoblingen. Prøv igjen.",
      bannerErrorNoClient: "Du må opprette eller velge en kunde først.",
      bannerErrorPrefix: "Feil: {key}",
      bannerSuccessInstagram: "Instagram-kontoen er koblet til.",
      bannerSuccessFacebook: "Facebook-siden er koblet til.",
      bannerSuccessTiktok: "TikTok-kontoen er koblet til.",
      bannerSuccessYoutube: "YouTube-kanalen er koblet til.",
      adminBack: "Tilbake til dashboard",
      adminTitle: "Godkjente e-poster",
      adminSubtitle: "Legg til e-postadresser som skal kunne registrere seg i Gjensvar.",
      adminEmailPlaceholder: "bruker@epost.no",
      adminAdd: "Legg til",
      adminAdding: "Legger til…",
      adminLoading: "Laster…",
      adminEmpty: "Ingen e-poster lagt til ennå.",
      adminAddedAt: "Lagt til {date}",
      adminRemove: "Fjern",
      adminRemoving: "Fjerner…",
      adminFetchError: "Kunne ikke hente listen.",
    },
  },
  en: {
    common: {
      login: "Sign in",
      signupCta: "Create account",
      requestAccess: "Request access",
      contact: "Contact",
      or: "or",
      loading: "Loading…",
      next: "Next",
    },
    auth: {
      loginTab: "Sign in",
      signupTab: "Create account",
      terms: "Terms",
      privacy: "Privacy",
      footerCopyright: "Gjensvar by {company}",
    },
    legal: {
      back: "Back",
      backToHome: "Back to home",
      backToDashboard: "Back to dashboard",
    },
    landing: {
      topbarLogin: "Sign in",
      badge: "Limited access — for approved Norwegian marketing agencies only",
      title: "Unified video analytics for agencies that film for others",
      subtitle:
        "Gjensvar is built for marketing agencies that produce video content on behalf of their clients. Connect your clients' TikTok, Instagram, YouTube and Facebook accounts and see all the numbers in one place — without logging into five different platforms.",
      ctaPrimary: "Sign in",
      ctaSecondary: "Request access",
      previewLabel: "A quick look inside the dashboard",
      previewClient: "Brand Co.",
      previewKpiViews: "Total views",
      previewKpiGrowth: "Growth",
      previewKpiLikes: "Likes",
      previewKpiVideos: "Videos",
      previewTableDate: "Date",
      previewTableTitle: "Title",
      previewTableTotal: "Total",
      previewVideo1: "Spring campaign 2026",
      previewVideo2: "Behind the scenes",
      previewVideo3: "Product launch",
      previewVideo4: "Customer interview",
      platformsHeading: "Supported platforms",
      platformsCaption:
        "TikTok, Instagram, YouTube and Facebook sync automatically. Snapchat numbers are entered manually.",
      featuresEyebrow: "Features",
      featuresHeading: "Everything an agency needs",
      feature1Title: "Unified view counts",
      feature1Desc:
        "See how many times a video has been watched in total — across every platform it was posted on. Gjensvar groups videos posted on the same day automatically.",
      feature2Title: "Automatic updates",
      feature2Desc:
        "Connect your client's accounts once. Gjensvar pulls in new videos and updated metrics every time you open the dashboard.",
      feature3Title: "One user, many clients",
      feature3Desc:
        "Switch between your clients in the dashboard. Each client has their own accounts, their own numbers and their own report — fully separated.",
      feature4Title: "Ready-made PDF reports",
      feature4Desc:
        "Download styled reports directly from the dashboard. Forward them to the client without editing a single number.",
      stepsEyebrow: "How it works",
      stepsHeading: "From access to finished report",
      stepsIntro:
        "Gjensvar is built so most of the work happens automatically. You connect the accounts once and spend the rest of your time on what matters — making content for your clients.",
      step1Title: "Apply for access",
      step1Desc:
        "Send us a short email about your agency. We approve manually to keep the service safe, and let you know once your account is ready.",
      step2Title: "Add your clients",
      step2Desc:
        "Create one client for each business you make content for, and connect their TikTok, Instagram, YouTube and Facebook through the official sign-in flows.",
      step3Title: "Let Gjensvar do the work",
      step3Desc:
        "Every time a video is posted, the numbers are pulled in automatically. You see views, likes and comments for each platform, plus a combined total per video.",
      step4Title: "Deliver to your client",
      step4Desc:
        "Export a styled report whenever your client wants a summary. Pick a period, download the PDF, and forward it.",
      audienceHeading: "Who is Gjensvar for?",
      audienceP1:
        "Gjensvar is built specifically for marketing agencies that produce video content for other businesses — not for brands managing their own accounts.",
      audienceP2:
        "If you are an agency that films, edits and publishes on behalf of your clients, you know how tedious it is to gather numbers from five different platforms every month. Gjensvar removes the manual work and lets you focus on the content itself.",
      audienceP3:
        "Access is limited to approved agencies. Send us a short email with the name of your agency and the clients you work with, and we'll get in touch.",
      finalHeading: "Already whitelisted?",
      finalDesc:
        "Sign in to view your clients' video performance across platforms.",
      finalCta: "Sign in to Gjensvar",
    },
    login: {
      haveNoAccount: "No account yet?",
      createAccount: "Create account",
      welcomeEyebrow: "Welcome back",
      title: "Sign in to Gjensvar",
      subtitle:
        "A unified view of your content and engagement across platforms.",
      emailLabel: "Email",
      emailPlaceholder: "name@company.com",
      passwordLabel: "Password",
      forgotPassword: "Forgot password?",
      submit: "Sign in",
      submitting: "Signing in…",
      errorInvalid: "Wrong email or password. Please try again.",
      newToGjensvar: "New to Gjensvar?",
      legalAgree: "By signing in you agree to our {terms} and {privacy}.",
    },
    signup: {
      haveAccount: "Already have an account?",
      loginLink: "Sign in",
      eyebrow: "Get started",
      title: "Create your account",
      subtitle:
        "Access requires that your email address has been approved by an administrator.",
      firstNameLabel: "First name",
      firstNamePlaceholder: "Jane",
      lastNameLabel: "Last name",
      lastNamePlaceholder: "Doe",
      companyLabel: "Company",
      companyPlaceholder: "Company name",
      emailLabel: "Email",
      emailPlaceholder: "name@company.com",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 10 characters",
      passwordHint:
        "Use at least 10 characters with a mix of upper and lower case letters, numbers and symbols.",
      passwordWeak: "Weak password",
      passwordOk: "Decent password",
      passwordStrong: "Strong password",
      acceptTermsBefore: "I accept the ",
      acceptTermsLinkTerms: "terms",
      acceptTermsAnd: " and ",
      acceptTermsLinkPrivacy: "privacy policy",
      submit: "Create account",
      submitting: "Creating…",
      errorPasswordShort: "The password must be at least 10 characters.",
      errorTermsRequired: "You must accept the terms to continue.",
      successTitle: "Account created",
      successDesc: "You can now sign in with your email and password.",
      successLogin: "Go to sign in",
      alreadyMember: "Already have an account?",
    },
    forgotPassword: {
      rememberQuestion: "Remember your password?",
      loginLink: "Sign in",
      eyebrow: "Reset password",
      title: "Forgot your password?",
      subtitle:
        "Enter your email address and we'll send you a link to reset your password.",
      emailLabel: "Email",
      emailPlaceholder: "name@company.com",
      submit: "Send reset link",
      submitting: "Sending…",
      errorGeneric: "Could not send the reset link. Please try again.",
      successHeading: "Check your inbox",
      successDescBefore: "We've sent a reset link to ",
      successDescAfter:
        ". Click the link in the email to finish resetting your password.",
      backToLogin: "Back to sign in",
    },
    resetPassword: {
      eyebrow: "New password",
      title: "Choose a new password",
      subtitle:
        "Pick a password you'll remember and that's strong enough to keep your account safe.",
      passwordLabel: "New password",
      passwordPlaceholder: "At least 8 characters",
      confirmLabel: "Confirm password",
      confirmPlaceholder: "Repeat your password",
      passwordHint: "Use at least 8 characters. 12+ is recommended.",
      submit: "Update password",
      submitting: "Saving…",
      errorTooShort: "Password must be at least 8 characters.",
      errorMismatch: "Passwords don't match.",
      errorGeneric:
        "Could not update the password. The link may have expired — request a new one.",
      backToLogin: "Back to sign in",
    },
    setupPassword: {
      eyebrow: "Welcome to Gjensvar",
      title: "Set up your account",
      subtitle:
        "Choose a password for your account and you'll be ready to start using Gjensvar.",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmLabel: "Confirm password",
      confirmPlaceholder: "Repeat your password",
      passwordHint: "Use at least 8 characters. 12+ is recommended.",
      submit: "Set password and sign in",
      submitting: "Saving…",
      errorTooShort: "Password must be at least 8 characters.",
      errorMismatch: "Passwords don't match.",
      errorGeneric: "Could not set password. Please try again.",
    },
    dashboard: {
      logout: "Sign out",
      menu: "Menu",
      adminApprovedEmails: "Approved emails",
      sync: "Sync",
      syncing: "Syncing…",
      syncDataTitle: "Syncing data",
      syncDoneTitle: "Sync complete",
      syncWaiting: "Waiting…",
      syncStarting: "Starting…",
      syncWorking: "Working…",
      syncProgress: "{current} of {total}",
      syncNoData: "No data",
      syncNotConnected: "Not connected",
      syncFailed: "Failed",
      syncStreamEmpty: "The stream is empty.",
      syncErrorPrefix: "Error: {status}",
      syncEmptyError: "Could not parse event:",
      syncUnknownError: "Unknown error",
      close: "Close",
      selectClient: "Select client",
      clients: "Clients",
      noClients: "No clients yet",
      createNewClient: "Create new client",
      create: "Create",
      creating: "Creating…",
      clientNamePlaceholder: "Client name",
      deleteClient: "Delete client",
      deleteClientWarn:
        "All data linked to this client will be permanently deleted. Type {name} to confirm.",
      cancel: "Cancel",
      delete: "Delete",
      deleting: "Deleting…",
      renameClient: "Rename client",
      rename: "Rename",
      renaming: "Saving…",
      saveChanges: "Save",
      platforms: "Platforms",
      connectPlatform: "Connect {platform}",
      switchAccount: "Switch account",
      disconnect: "Disconnect",
      comingSoon: "Coming soon",
      snapchatManual: "Snapchat",
      snapchatManualNoCount: "Enter numbers manually",
      snapchatManualWithCount: "{count} manual posts",
      snapchatManualWithCountSingular: "{count} manual post",
      manage: "Manage",
      snapchatModalTitle: "Snapchat — manual numbers",
      snapchatModalSubtitle:
        "Snapchat doesn't offer an analytics API, so the numbers must be entered manually. Posts appear in the dashboard the same way as data from other platforms.",
      snapchatModalAdd: "Add post",
      snapchatModalEmpty: "No manual Snapchat posts yet.",
      snapchatModalLoading: "Loading…",
      snapchatModalLoadingError: "Could not load posts.",
      snapchatModalDelete: "Delete",
      snapchatModalEdit: "Edit",
      snapchatCaptionLabel: "Title / caption",
      snapchatCaptionPlaceholder: "Optional short text",
      snapchatPostedAtLabel: "Date",
      snapchatViewsLabel: "Views",
      snapchatScreenshotsLabel: "Screenshots",
      snapchatSharesLabel: "Shares",
      snapchatPermalinkLabel: "Link",
      snapchatPermalinkPlaceholder: "https://www.snapchat.com/…",
      snapchatSavingError: "Could not save. Please try again.",
      snapchatRequiredField: "Required",
      snapchatInvalidNumber: "Invalid number",
      snapchatInlineHover: "Click to enter Snapchat views",
      snapchatInlineSave: "Save",
      snapchatInlineCancel: "Cancel",
      welcome: "Your dashboard",
      welcomeSubtitle: "here's your",
      overviewSubtitle:
        "Unified overview of content, views and engagement across platforms.",
      overviewSubtitleClient:
        "Unified overview for {client} across platforms.",
      notSynced: "Not synced yet",
      period: "Period",
      year: "Year",
      month: "Month",
      week: "Week",
      selectMonth: "Select month",
      selectWeek: "Select week",
      selectYear: "Select year",
      weekShort: "Week {n}",
      monthly: "Monthly",
      weekly: "Weekly",
      tabVideos: "Videos",
      tabViews: "Views",
      tabPosts: "Posts",
      tabAnalytics: "Analytics",
      export: "Export",
      exportCsv: "Download CSV",
      exportCsvDesc: "Raw data for the selected tab",
      exportPdf: "Download PDF",
      exportPdfDesc: "Client-ready",
      exportBrandLabel: "Report brand name",
      exportBrandPlaceholder: "E.g. Brand Co.",
      exportBrandHint: "Shown at the top of every PDF export for this client.",
      exportBrandSaving: "Saving…",
      exportYearReport: "Annual report",
      exportYearReportDesc: "Full-year report with charts",
      exportMonthReport: "Monthly report",
      exportMonthReportDesc: "Period-based client report",
      exportWeekReport: "Weekly report",
      exportWeekReportDesc: "Weekly summary",
      download: "Download",
      kpiTotalViews: "Total views",
      kpiGrowth: "Growth",
      kpiBestVideo: "Top video",
      kpiEngagement: "Engagement",
      kpiTotalLikes: "Total likes",
      kpiTotalPosts: "Posts",
      comparedTo: "vs. {value} same period last year",
      noPreviousData: "No comparison data",
      noBestVideo: "No videos yet",
      tableDate: "Date",
      tableTitle: "Title",
      tableTags: "Tags",
      tableTotal: "Total",
      tableTotalLower: "Total",
      tableLikes: "Likes",
      tableMonth: "Month",
      tableWeek: "Week",
      noDataYet: "No videos synced yet.",
      noVideosYet: "No videos yet.",
      loadingAnalytics: "Loading analytics…",
      viewsCaptionVideos:
        "Views per video by platform in {period}.",
      viewsCaptionMonthly: "Total views per month in {period}.",
      viewsCaptionWeekly: "Total views per week in {period}.",
      viewsCaptionPosts: "Posts per platform per month in {period}.",
      rowMerge: "Merge",
      rowMergeTooltip: "Merge this row with another",
      rowMergeWith: "Merge with:",
      rowMergeNoCandidates: "No other rows to merge with.",
      rowMergeConfirm: "Merge",
      rowMergeMerging: "Merging…",
      rowSeparate: "Separate",
      rowSeparateTooltip: "Move this video to its own row",
      rowSeparating: "Separating…",
      rowMoreActions: "More actions",
      rowEditDate: "Edit date",
      rowEditTitle: "Edit title",
      rowSaveDate: "Save",
      rowDeletePlatform: "Hide from this platform",
      rowHideRow: "Hide entire row",
      rowHidden: "Hidden",
      rowDateOverridden: "Date set manually",
      rowOpenOn: "Open on {platform}",
      rowResetDate: "Reset date",
      hiddenVideosTitle: "Hidden videos",
      hiddenVideosSubtitle:
        "Videos you've hidden from the dashboard. You can show them again at any time.",
      hiddenVideosEmpty: "No hidden videos.",
      hiddenVideosUnhide: "Show again",
      hiddenVideosCount: "{count} hidden videos",
      hiddenVideosCountSingular: "{count} hidden video",
      titleEditPlaceholder: "Enter title",
      titleEditSave: "Save",
      titleEditCancel: "Cancel",
      categoryAdd: "Add tag",
      categoryNew: "New tag",
      categoryPlaceholder: "Tag name",
      categoryRemove: "Remove tag",
      categoryRename: "Rename tag",
      onboardingTitle: "Create your first client",
      onboardingDesc:
        "Each client has their own connected platforms and separate data. Create one for each agency project you work on.",
      onboardingButton: "Create client",
      onboardingPlaceholder: "E.g. Brand Co.",
      onboardingCreating: "Creating…",
      statusBannerSyncing: "Syncing platforms…",
      statusBannerSynced: "Data updated just now",
      statusBannerError: "Something went wrong while syncing",
      sidebarOverview: "Overview",
      sidebarSettings: "Settings",
      sidebarBack: "Back to dashboard",
      monthJan: "January",
      monthFeb: "February",
      monthMar: "March",
      monthApr: "April",
      monthMay: "May",
      monthJun: "June",
      monthJul: "July",
      monthAug: "August",
      monthSep: "September",
      monthOct: "October",
      monthNov: "November",
      monthDec: "December",
      monthShortJan: "Jan",
      monthShortFeb: "Feb",
      monthShortMar: "Mar",
      monthShortApr: "Apr",
      monthShortMay: "May",
      monthShortJun: "Jun",
      monthShortJul: "Jul",
      monthShortAug: "Aug",
      monthShortSep: "Sep",
      monthShortOct: "Oct",
      monthShortNov: "Nov",
      monthShortDec: "Dec",
      analyticsTitle: "Analytics",
      analyticsViewsOverTime: "Views over time",
      analyticsViewsOverTimeSub: "Monthly trend per platform in {year}",
      analyticsTopVideos: "Top 10 videos",
      analyticsTopVideosSub: "Videos with the most views in {year}",
      analyticsByPlatform: "Platform breakdown",
      analyticsByPlatformSub: "Share of views per platform in {year}",
      analyticsCategoryMix: "Content mix",
      analyticsNoVideos: "No videos for this year.",
      analyticsViews: "Views",
      analyticsLikes: "Likes",
      analyticsComments: "Comments",
      analyticsShares: "Shares",
      analyticsViewsPerMonth: "Views per month",
      analyticsViewsPerMonthSub: "Stacked distribution per platform in {year}",
      analyticsPostsVsViews: "Posts vs. views",
      analyticsPostsVsViewsSub: "Posting frequency vs. views in {year}",
      analyticsAvgViews: "Avg. views per post",
      analyticsAvgViewsSub: "Average views per posting in {year}",
      analyticsTotalLabel: "Total",
      analyticsPostsLabel: "Posts",
      analyticsTotalViews: "Total views",
      of: "of",
      noTitle: "Untitled",
      bannerErrorMetaAuthFailed:
        "Connection cancelled. You must approve the Gjensvar app to connect Facebook or Instagram.",
      bannerErrorConfig:
        "Server configuration error. Please contact support if this continues.",
      bannerErrorNotAuthenticated: "Please sign in again to connect accounts.",
      bannerErrorNoClientSelected: "Select an active client in the top bar before connecting an account.",
      bannerErrorStateMismatch: "Security token didn't match. Try connecting again from the dashboard.",
      bannerErrorTokenExchangeFailed: "Couldn't get an access token from Meta. Please try again shortly.",
      bannerErrorLongLivedTokenFailed: "Couldn't upgrade the Meta token to a long-lived version. Please try again.",
      bannerErrorNoPagesFound:
        "No Facebook Pages found. Make sure you (1) check at least one Page in Meta's access dialog, and (2) are an admin on a Facebook Page. Click \"Edit access\" if Meta skips Page selection.",
      bannerErrorNoIgBusinessAccount:
        "No Instagram Business/Creator account found. The Instagram account must be Professional and linked to a Facebook Page you manage.",
      bannerErrorDb: "The database could not save the connection. Please try again.",
      bannerErrorUnexpected: "Something unexpected happened during the connection. Please try again.",
      bannerErrorNoClient: "You must create or select a client first.",
      bannerErrorPrefix: "Error: {key}",
      bannerSuccessInstagram: "Instagram account connected.",
      bannerSuccessFacebook: "Facebook Page connected.",
      bannerSuccessTiktok: "TikTok account connected.",
      bannerSuccessYoutube: "YouTube channel connected.",
      adminBack: "Back to dashboard",
      adminTitle: "Approved emails",
      adminSubtitle: "Add email addresses allowed to register in Gjensvar.",
      adminEmailPlaceholder: "user@email.com",
      adminAdd: "Add",
      adminAdding: "Adding…",
      adminLoading: "Loading…",
      adminEmpty: "No emails added yet.",
      adminAddedAt: "Added {date}",
      adminRemove: "Remove",
      adminRemoving: "Removing…",
      adminFetchError: "Could not fetch the list.",
    },
  },
};

export type TranslationKey =
  | `common.${keyof TranslationDict["common"]}`
  | `auth.${keyof TranslationDict["auth"]}`
  | `legal.${keyof TranslationDict["legal"]}`
  | `landing.${keyof TranslationDict["landing"]}`
  | `login.${keyof TranslationDict["login"]}`
  | `signup.${keyof TranslationDict["signup"]}`
  | `forgotPassword.${keyof TranslationDict["forgotPassword"]}`
  | `resetPassword.${keyof TranslationDict["resetPassword"]}`
  | `setupPassword.${keyof TranslationDict["setupPassword"]}`
  | `dashboard.${keyof TranslationDict["dashboard"]}`;

export function getTranslation(lang: Lang, key: TranslationKey): string {
  const [section, leaf] = key.split(".") as [
    keyof TranslationDict,
    string,
  ];
  const dict = translations[lang][section] as Record<string, string>;
  return dict?.[leaf] ?? key;
}
