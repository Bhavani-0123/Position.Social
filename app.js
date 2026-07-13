/* ==========================================================================
   Application Logic - Community Connect (Overhauled)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // ============================================================
  // State Management
  // ============================================================
  const state = {
    currentStep: 1,
    totalSteps: 2,
    logoDataUrl: null,
    industries: [],
    tags: [],
    communityData: null, // Saved after publish
    countryData: {
      "United States": {
        states: {
          "California": ["San Francisco", "Los Angeles", "San Diego"],
          "New York": ["New York City", "Buffalo", "Rochester"],
          "Texas": ["Austin", "Houston", "Dallas"]
        }
      },
      "India": {
        states: {
          "Karnataka": ["Bengaluru", "Mysore", "Hubli"],
          "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
          "Delhi": ["New Delhi", "Dwarka"]
        }
      },
      "Canada": {
        states: {
          "Ontario": ["Toronto", "Ottawa", "Hamilton"],
          "British Columbia": ["Vancouver", "Victoria", "Kelowna"],
          "Quebec": ["Montreal", "Quebec City"]
        }
      },
      "United Kingdom": {
        states: {
          "England": ["London", "Manchester", "Birmingham"],
          "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"]
        }
      }
    }
  };

  // Industries available for multi-select
  const availableIndustries = [
    "Technology", "Software Development", "Artificial Intelligence",
    "Biotechnology", "Healthcare", "Education", "Creative Arts",
    "Design", "Finance", "Fintech", "Social Services", "NGO & Non-Profit",
    "Environmental Research", "Corporate Management", "Academic Study"
  ];

  // Mock member data for permissions & analytics
  const mockMembers = [
    { id: 1, name: "Alex Johnson", email: "alex.johnson@example.com", initials: "AJ", role: "main-admin", color: "#F97316", joinDate: "2026-06-15", joinTime: "09:32 AM", status: "active", isCurrentAdmin: true },
    { id: 2, name: "Priya Sharma", email: "priya.sharma@example.com", initials: "PS", role: "admin", color: "#8B5CF6", joinDate: "2026-06-16", joinTime: "11:14 AM", status: "active", isCurrentAdmin: false },
    { id: 3, name: "Marcus Lee", email: "marcus.lee@example.com", initials: "ML", role: "moderator", color: "#3B82F6", joinDate: "2026-06-18", joinTime: "02:45 PM", status: "active", isCurrentAdmin: false },
    { id: 4, name: "Sarah Chen", email: "sarah.chen@example.com", initials: "SC", role: "member", color: "#10B981", joinDate: "2026-06-20", joinTime: "10:00 AM", status: "active", isCurrentAdmin: false },
    { id: 5, name: "David Park", email: "david.park@example.com", initials: "DP", role: "member", color: "#F59E0B", joinDate: "2026-06-22", joinTime: "04:20 PM", status: "active", isCurrentAdmin: false },
    { id: 6, name: "Zara Ahmed", email: "zara.ahmed@example.com", initials: "ZA", role: "member", color: "#EC4899", joinDate: "2026-06-25", joinTime: "08:55 AM", status: "pending", isCurrentAdmin: false },
    { id: 7, name: "Tom Wilson", email: "tom.wilson@example.com", initials: "TW", role: "member", color: "#14B8A6", joinDate: "2026-06-28", joinTime: "01:10 PM", status: "active", isCurrentAdmin: false },
    { id: 8, name: "Nina Patel", email: "nina.patel@example.com", initials: "NP", role: "moderator", color: "#6366F1", joinDate: "2026-07-01", joinTime: "03:30 PM", status: "active", isCurrentAdmin: false },
    { id: 9, name: "Carlos Rivera", email: "carlos.rivera@example.com", initials: "CR", role: "member", color: "#F97316", joinDate: "2026-07-03", joinTime: "12:00 PM", status: "inactive", isCurrentAdmin: false },
    { id: 10, name: "Amelia Brown", email: "amelia.brown@example.com", initials: "AB", role: "member", color: "#EF4444", joinDate: "2026-07-05", joinTime: "09:15 AM", status: "active", isCurrentAdmin: false },
    { id: 11, name: "Raj Gupta", email: "raj.gupta@example.com", initials: "RG", role: "member", color: "#84CC16", joinDate: "2026-07-07", joinTime: "05:00 PM", status: "active", isCurrentAdmin: false },
    { id: 12, name: "Lisa Nguyen", email: "lisa.nguyen@example.com", initials: "LN", role: "member", color: "#06B6D4", joinDate: "2026-07-10", joinTime: "10:40 AM", status: "pending", isCurrentAdmin: false },
  ];

  // Default permissions per role
  const defaultPermissions = {
    "main-admin": { memberMgmt: true, adminMgmt: true, content: true, events: true, comms: true, moderation: true, analytics: true },
    "admin": { memberMgmt: true, adminMgmt: false, content: true, events: true, comms: true, moderation: true, analytics: true },
    "moderator": { memberMgmt: false, adminMgmt: false, content: true, events: false, comms: true, moderation: true, analytics: false },
    "member": { memberMgmt: false, adminMgmt: false, content: false, events: false, comms: false, moderation: false, analytics: false }
  };

  // Mutable permissions state (per member id)
  const memberPermissions = {};
  mockMembers.forEach(m => {
    memberPermissions[m.id] = { ...defaultPermissions[m.role] };
  });

  // ============================================================
  // DOM References - Creation Wizard
  // ============================================================
  const creationWizard = document.getElementById('creation-wizard');
  const communityDashboard = document.getElementById('community-dashboard');

  const stepIndicators = document.querySelectorAll('.step-indicator');
  const progressLine = document.getElementById('progress-line');
  const formPanes = document.querySelectorAll('.form-step-pane');
  const communityForm = document.getElementById('community-form');

  const footerBtnBack = document.getElementById('footer-btn-back');
  const footerBtnSave = document.getElementById('footer-btn-save');
  const footerBtnContinue = document.getElementById('footer-btn-continue');
  const headerSaveDraft = document.getElementById('header-save-draft');
  const headerPublish = document.getElementById('header-publish');

  // Selects
  const countryCodeTrigger = document.getElementById('country-code-trigger');
  const countryCodeOptions = document.getElementById('country-code-options');
  const selectedCountryCode = document.getElementById('selected-country-code');

  const specializationTrigger = document.getElementById('specialization-trigger');
  const specializationOptions = document.getElementById('specialization-options');
  const selectedSpecialization = document.getElementById('selected-specialization');

  const categoryTrigger = document.getElementById('category-trigger');
  const categoryOptions = document.getElementById('category-options');
  const selectedCategory = document.getElementById('selected-category');

  const countryTrigger = document.getElementById('country-trigger');
  const countryOptions = document.getElementById('country-options');
  const selectedCountry = document.getElementById('selected-country');

  const stateSelectWrapper = document.getElementById('state-select-wrapper');
  const stateTrigger = document.getElementById('state-trigger');
  const stateOptions = document.getElementById('state-options');
  const selectedState = document.getElementById('selected-state');

  const citySelectWrapper = document.getElementById('city-select-wrapper');
  const cityTrigger = document.getElementById('city-trigger');
  const cityOptions = document.getElementById('city-options');
  const selectedCity = document.getElementById('selected-city');

  // Modals
  const modalDraftSaved = document.getElementById('modal-draft-saved');
  const modalSuccessPublish = document.getElementById('modal-success-publish');
  const modalEditCommunity = document.getElementById('modal-edit-community');
  const modalDeleteConfirm = document.getElementById('modal-delete-confirm');

  // Inputs
  const logoInput = document.getElementById('logo-input');
  const logoDropzone = document.getElementById('logo-dropzone');
  const uploadPlaceholderState = document.getElementById('upload-placeholder-state');
  const uploadPreviewState = document.getElementById('upload-preview-state');
  const logoImgPreview = document.getElementById('logo-img-preview');
  const btnRemoveLogo = document.getElementById('btn-remove-logo');

  const inputCommunityName = document.getElementById('community-name');
  const inputCommunitySlug = document.getElementById('community-slug');
  const inputEmailId = document.getElementById('email-id');
  const inputPhoneNumber = document.getElementById('phone-number');
  const websiteUrlGroup = document.getElementById('website-url-group');
  const inputWebsiteUrl = document.getElementById('website-url');
  const inputMission = document.getElementById('mission-statement');
  const inputVision = document.getElementById('vision-statement');
  const inputCommunityDesc = document.getElementById('community-desc');
  const inputHighlights = document.getElementById('highlights-statement');
  const inputFoundedDate = document.getElementById('founded-date');
  const inputMemberCount = document.getElementById('member-count');
  const inputAddress = document.getElementById('address-details');
  const inputTagText = document.getElementById('tag-text-input');
  const tagInputBox = document.getElementById('tag-input-box');
  const tagsWrapper = document.getElementById('tags-wrapper');

  /* ==========================================================================
     0. Helper Utilities & Validators
     ========================================================================== */

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateUrl = (url) => {
    try { new URL(url); return true; } catch (_) { return false; }
  };

  const setFieldError = (element, message) => {
    const group = element.closest('.form-group');
    if (!group) return;
    group.classList.add('has-error');
    const errMsg = group.querySelector('.error-msg');
    if (errMsg) errMsg.textContent = message;
  };

  const clearFieldError = (element) => {
    const group = element.closest('.form-group');
    if (!group) return;
    group.classList.remove('has-error');
    const errMsg = group.querySelector('.error-msg');
    if (errMsg) errMsg.textContent = '';
  };

  const setupErrorClearing = () => {
    const inputs = communityForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => clearFieldError(input));
      input.addEventListener('change', () => clearFieldError(input));
    });
  };

  const slugify = (text) => text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').substring(0, 50);

  const toggleModal = (modal, open) => {
    if (!modal) return;
    if (open) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
  };

  setupErrorClearing();

  /* ==========================================================================
     1. Custom Selects Infrastructure
     ========================================================================== */

  const setupCustomSelect = (trigger, optionsBox) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns(optionsBox);
      trigger.classList.toggle('active');
      optionsBox.classList.toggle('hidden');
    });

    optionsBox.addEventListener('click', (e) => {
      const option = e.target.closest('.select-option');
      if (!option) return;
      const value = option.dataset.value;
      const text = option.textContent;
      const displaySpan = trigger.querySelector('span');
      displaySpan.textContent = text;
      displaySpan.classList.remove('placeholder-text');
      trigger.dataset.value = value;
      optionsBox.querySelectorAll('.select-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      trigger.classList.remove('active');
      optionsBox.classList.add('hidden');
      const event = new CustomEvent('change', { detail: { value, text } });
      trigger.dispatchEvent(event);
      clearFieldError(trigger);
    });
  };

  const closeAllDropdowns = (exceptBox = null) => {
    document.querySelectorAll('.custom-select-options, .multiselect-dropdown').forEach(box => {
      if (box !== exceptBox) {
        box.classList.add('hidden');
        const trigger = box.previousElementSibling;
        if (trigger) trigger.classList.remove('active');
      }
    });
  };

  document.addEventListener('click', () => closeAllDropdowns());

  setupCustomSelect(countryCodeTrigger, countryCodeOptions);
  setupCustomSelect(specializationTrigger, specializationOptions);
  setupCustomSelect(categoryTrigger, categoryOptions);

  /* ==========================================================================
     2. Country-State-City Chain Loader
     ========================================================================== */

  const loadCountries = () => {
    countryOptions.innerHTML = '';
    Object.keys(state.countryData).forEach(country => {
      const opt = document.createElement('div');
      opt.className = 'select-option';
      opt.dataset.value = country;
      opt.textContent = country;
      countryOptions.appendChild(opt);
    });
  };
  loadCountries();
  setupCustomSelect(countryTrigger, countryOptions);

  countryTrigger.addEventListener('change', (e) => {
    const country = e.detail.value;
    stateSelectWrapper.classList.remove('disabled');
    selectedState.textContent = 'Select State...';
    selectedState.classList.add('placeholder-text');
    stateTrigger.dataset.value = '';
    stateOptions.innerHTML = '';
    citySelectWrapper.classList.add('disabled');
    selectedCity.textContent = 'Select City...';
    selectedCity.classList.add('placeholder-text');
    cityTrigger.dataset.value = '';
    cityOptions.innerHTML = '';
    const states = state.countryData[country].states;
    Object.keys(states).forEach(st => {
      const opt = document.createElement('div');
      opt.className = 'select-option';
      opt.dataset.value = st;
      opt.textContent = st;
      stateOptions.appendChild(opt);
    });
  });

  setupCustomSelect(stateTrigger, stateOptions);

  stateTrigger.addEventListener('change', (e) => {
    const country = countryTrigger.dataset.value;
    const stateVal = e.detail.value;
    citySelectWrapper.classList.remove('disabled');
    selectedCity.textContent = 'Select City...';
    selectedCity.classList.add('placeholder-text');
    cityTrigger.dataset.value = '';
    cityOptions.innerHTML = '';
    const cities = state.countryData[country].states[stateVal];
    cities.forEach(ct => {
      const opt = document.createElement('div');
      opt.className = 'select-option';
      opt.dataset.value = ct;
      opt.textContent = ct;
      cityOptions.appendChild(opt);
    });
  });

  setupCustomSelect(cityTrigger, cityOptions);

  /* ==========================================================================
     3. Searchable Multi-Select Dropdown (Industry)
     ========================================================================== */

  const industryTrigger = document.getElementById('industry-trigger');
  const industryDropdown = document.getElementById('industry-dropdown');
  const industrySearchInput = document.getElementById('industry-search-input');
  const industryList = document.getElementById('industry-list');

  industryTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns(industryDropdown);
    industryTrigger.classList.toggle('active');
    industryDropdown.classList.toggle('hidden');
    if (!industryDropdown.classList.contains('hidden')) industrySearchInput.focus();
  });

  industrySearchInput.addEventListener('click', (e) => e.stopPropagation());

  const renderIndustries = (filterText = '') => {
    industryList.innerHTML = '';
    const filtered = availableIndustries.filter(ind => ind.toLowerCase().includes(filterText.toLowerCase()));
    if (filtered.length === 0) {
      industryList.innerHTML = '<div class="select-option placeholder-text py-sm">No match found</div>';
      return;
    }
    filtered.forEach(ind => {
      const isSelected = state.industries.includes(ind);
      const opt = document.createElement('div');
      opt.className = `dropdown-option ${isSelected ? 'selected' : ''}`;
      opt.dataset.value = ind;
      opt.innerHTML = `<span>${ind}</span><i data-lucide="check" class="check-icon"></i>`;
      industryList.appendChild(opt);
    });
    lucide.createIcons();
  };
  renderIndustries();

  industrySearchInput.addEventListener('input', (e) => renderIndustries(e.target.value));

  industryList.addEventListener('click', (e) => {
    e.stopPropagation();
    const opt = e.target.closest('.dropdown-option');
    if (!opt) return;
    const val = opt.dataset.value;
    const index = state.industries.indexOf(val);
    if (index === -1) state.industries.push(val);
    else state.industries.splice(index, 1);
    renderIndustryChips();
    renderIndustries(industrySearchInput.value);
    clearFieldError(industryTrigger);
  });

  const renderIndustryChips = () => {
    const chipsHolder = document.getElementById('industry-selected-chips');
    chipsHolder.innerHTML = '';
    if (state.industries.length === 0) {
      chipsHolder.innerHTML = '<span class="placeholder-text">Search and select industries...</span>';
      return;
    }
    state.industries.forEach(ind => {
      const chip = document.createElement('span');
      chip.className = 'industry-chip';
      chip.innerHTML = `${ind}<i data-lucide="x" class="btn-remove-ind" data-val="${ind}"></i>`;
      chipsHolder.appendChild(chip);
    });
    lucide.createIcons();
  };

  document.getElementById('industry-selected-chips').addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.btn-remove-ind');
    if (!closeBtn) return;
    e.stopPropagation();
    const val = closeBtn.dataset.val;
    const index = state.industries.indexOf(val);
    if (index !== -1) {
      state.industries.splice(index, 1);
      renderIndustryChips();
      renderIndustries(industrySearchInput.value);
    }
  });

  /* ==========================================================================
     4. Drag-and-Drop Image Logo Upload
     ========================================================================== */

  logoDropzone.addEventListener('click', (e) => {
    if (e.target.closest('#btn-remove-logo') || e.target.closest('.upload-preview-container')) return;
    logoInput.click();
  });

  ['dragenter', 'dragover'].forEach(ev => {
    logoDropzone.addEventListener(ev, (e) => { e.preventDefault(); logoDropzone.classList.add('dragover'); }, false);
  });
  ['dragleave', 'drop'].forEach(ev => {
    logoDropzone.addEventListener(ev, (e) => { e.preventDefault(); logoDropzone.classList.remove('dragover'); }, false);
  });

  logoDropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleLogoFile(files[0]);
  });

  logoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleLogoFile(e.target.files[0]);
  });

  const handleLogoFile = (file) => {
    if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Image size exceeds 2MB limit.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      state.logoDataUrl = e.target.result;
      logoImgPreview.src = state.logoDataUrl;
      uploadPlaceholderState.classList.add('hidden');
      uploadPreviewState.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  };

  btnRemoveLogo.addEventListener('click', (e) => {
    e.stopPropagation();
    state.logoDataUrl = null;
    logoInput.value = '';
    uploadPlaceholderState.classList.remove('hidden');
    uploadPreviewState.classList.add('hidden');
    logoImgPreview.src = '';
  });

  /* ==========================================================================
     5. Tag Input Chips System
     ========================================================================== */

  tagInputBox.addEventListener('click', () => inputTagText.focus());

  inputTagText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputTagText.value.trim().replace(/,/g, '');
      if (val) addTag(val);
      inputTagText.value = '';
    }
  });

  const addTag = (text) => {
    if (state.tags.includes(text)) return;
    state.tags.push(text);
    renderTagChips();
  };

  const removeTag = (text) => {
    state.tags = state.tags.filter(t => t !== text);
    renderTagChips();
  };

  const renderTagChips = () => {
    const chips = tagsWrapper.querySelectorAll('.tag-chip');
    chips.forEach(c => c.remove());
    state.tags.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${t}<i data-lucide="x" class="btn-remove-tag" data-val="${t}"></i>`;
      tagsWrapper.insertBefore(chip, inputTagText);
    });
    lucide.createIcons();
  };

  tagsWrapper.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.btn-remove-tag');
    if (!closeBtn) return;
    removeTag(closeBtn.dataset.val);
  });

  /* ==========================================================================
     6. Auto-Slug & Input Sync
     ========================================================================== */

  inputCommunityName.addEventListener('input', () => {
    if (!inputCommunitySlug.dataset.customized) {
      inputCommunitySlug.value = slugify(inputCommunityName.value.trim());
    }
    clearFieldError(inputCommunityName);
  });

  inputCommunitySlug.addEventListener('input', () => {
    inputCommunitySlug.dataset.customized = true;
    inputCommunitySlug.value = slugify(inputCommunitySlug.value);
    clearFieldError(inputCommunitySlug);
  });

  inputCommunityDesc.addEventListener('input', () => {
    inputCommunityDesc.style.height = 'auto';
    inputCommunityDesc.style.height = inputCommunityDesc.scrollHeight + 'px';
  });

  // Conditional website URL
  document.querySelectorAll('input[name="has-website"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'yes') {
        websiteUrlGroup.classList.add('open');
        inputWebsiteUrl.setAttribute('required', 'required');
      } else {
        websiteUrlGroup.classList.remove('open');
        inputWebsiteUrl.removeAttribute('required');
        clearFieldError(inputWebsiteUrl);
      }
    });
  });

  // Conditional location details
  const locationDetailsGroup = document.getElementById('location-details-group');
  document.querySelectorAll('input[name="has-location"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'yes') {
        locationDetailsGroup.classList.add('open');
        setAddressRequired(true);
      } else {
        locationDetailsGroup.classList.remove('open');
        setAddressRequired(false);
        clearFieldError(countryTrigger);
        clearFieldError(stateTrigger);
        clearFieldError(cityTrigger);
        clearFieldError(inputAddress);
      }
    });
  });

  const setAddressRequired = (required) => {
    [countryTrigger, stateTrigger, cityTrigger, inputAddress].forEach(el => {
      if (required) el.setAttribute('required', 'required');
      else el.removeAttribute('required');
    });
  };

  /* ==========================================================================
     7. Step Navigation Router & Transition Handler (2 Steps Only)
     ========================================================================== */

  const navigateToStep = (step) => {
    if (step < 1 || step > state.totalSteps) return;
    const activePane = document.querySelector('.form-step-pane.active');
    activePane.style.opacity = 0;
    activePane.style.transform = 'translateY(-12px)';

    setTimeout(() => {
      formPanes.forEach(pane => pane.classList.remove('active'));
      state.currentStep = step;
      updateStepperUI();
      const newPane = document.getElementById(`pane-step-${step}`);
      newPane.classList.add('active');
      newPane.offsetHeight;
      newPane.style.opacity = 1;
      newPane.style.transform = 'translateY(0)';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const updateStepperUI = () => {
    const linePercent = (state.currentStep - 1) / (state.totalSteps - 1) * 100;
    progressLine.style.width = `${linePercent}%`;

    stepIndicators.forEach(ind => {
      const stepNum = parseInt(ind.dataset.step);
      ind.classList.remove('active', 'completed');
      if (stepNum === state.currentStep) {
        ind.classList.add('active');
        ind.querySelector('.step-number').innerHTML = stepNum;
      } else if (stepNum < state.currentStep) {
        ind.classList.add('completed');
        ind.querySelector('.step-number').innerHTML = '<i data-lucide="check" style="width:16px;height:16px;stroke-width:3"></i>';
      } else {
        ind.querySelector('.step-number').innerHTML = stepNum;
      }
    });

    lucide.createIcons();

    // Back button
    if (state.currentStep === 1) footerBtnBack.classList.add('hidden');
    else footerBtnBack.classList.remove('hidden');

    // Continue button text
    if (state.currentStep === state.totalSteps) {
      footerBtnContinue.innerHTML = 'Create & Publish Community <i data-lucide="rocket"></i>';
    } else {
      footerBtnContinue.innerHTML = 'Next Step <i data-lucide="arrow-right"></i>';
    }
    lucide.createIcons();
  };

  footerBtnBack.addEventListener('click', () => navigateToStep(state.currentStep - 1));

  stepIndicators.forEach(ind => {
    ind.addEventListener('click', () => {
      const targetStep = parseInt(ind.dataset.step);
      if (targetStep < state.currentStep) {
        navigateToStep(targetStep);
      } else if (targetStep > state.currentStep) {
        if (validateStep(state.currentStep)) navigateToStep(targetStep);
      }
    });
  });

  /* ==========================================================================
     8. Step Validations
     ========================================================================== */

  const validateStep = (step) => {
    let isValid = true;

    if (step === 1) {
      if (inputCommunityName.value.trim() === '') {
        setFieldError(inputCommunityName, 'Community name is required.');
        isValid = false;
      }
      if (inputCommunitySlug.value.trim() === '') {
        setFieldError(inputCommunitySlug, 'Unique community namespace slug is required.');
        isValid = false;
      }
      const email = inputEmailId.value.trim();
      if (email === '') {
        setFieldError(inputEmailId, 'Contact email address is required.');
        isValid = false;
      } else if (!validateEmail(email)) {
        setFieldError(inputEmailId, 'Please specify a valid email address structure.');
        isValid = false;
      }
      if (inputPhoneNumber.value.trim() === '') {
        setFieldError(inputPhoneNumber, 'Contact phone number is required.');
        isValid = false;
      }
      const hasWebsite = document.querySelector('input[name="has-website"]:checked').value === 'yes';
      if (hasWebsite && inputWebsiteUrl.value.trim() === '') {
        setFieldError(inputWebsiteUrl, 'Website URL is required if custom site option is selected.');
        isValid = false;
      } else if (hasWebsite && !validateUrl(inputWebsiteUrl.value.trim())) {
        setFieldError(inputWebsiteUrl, 'Please enter a valid URL (include http/https).');
        isValid = false;
      }
      const descText = inputCommunityDesc.value.trim();
      if (descText === '') {
        setFieldError(inputCommunityDesc, 'Description statement is required.');
        isValid = false;
      } else if (descText.length < 15) {
        setFieldError(inputCommunityDesc, 'Description must be at least 15 characters.');
        isValid = false;
      }
      if (state.industries.length === 0) {
        setFieldError(industryTrigger, 'Select at least one industry filter.');
        isValid = false;
      }
      if (!specializationTrigger.dataset.value) {
        setFieldError(specializationTrigger, 'Select an area of specialization.');
        isValid = false;
      }
      if (!categoryTrigger.dataset.value) {
        setFieldError(categoryTrigger, 'Category is required.');
        isValid = false;
      }
      if (inputFoundedDate.value === '') {
        setFieldError(inputFoundedDate, 'Founded date is required.');
        isValid = false;
      }
      if (inputMemberCount.value === '' || parseInt(inputMemberCount.value) < 1) {
        setFieldError(inputMemberCount, 'Please specify starting member count (minimum 1).');
        isValid = false;
      }
      const hasLocation = document.querySelector('input[name="has-location"]:checked').value === 'yes';
      if (hasLocation) {
        if (!countryTrigger.dataset.value) { setFieldError(countryTrigger, 'Country is required.'); isValid = false; }
        if (!stateTrigger.dataset.value) { setFieldError(stateTrigger, 'State is required.'); isValid = false; }
        if (!cityTrigger.dataset.value) { setFieldError(cityTrigger, 'City is required.'); isValid = false; }
        if (inputAddress.value.trim() === '') { setFieldError(inputAddress, 'Street address is required.'); isValid = false; }
      }
      const rulesAccepted = document.getElementById('rules-accepted');
      if (!rulesAccepted.checked) {
        setFieldError(rulesAccepted, 'You must accept the community code of conduct.');
        isValid = false;
      }
    }

    if (!isValid) {
      const firstErr = document.querySelector('.form-group.has-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  };

  /* ==========================================================================
     9. Continue/Publish Button
     ========================================================================== */

  footerBtnContinue.addEventListener('click', () => {
    if (state.currentStep < state.totalSteps) {
      if (validateStep(state.currentStep)) navigateToStep(state.currentStep + 1);
    } else {
      // Step 2 → Publish Community
      publishCommunity();
    }
  });

  headerPublish.addEventListener('click', () => {
    if (state.currentStep === 1) {
      if (!validateStep(1)) return;
      navigateToStep(2);
    } else {
      publishCommunity();
    }
  });

  const publishCommunity = () => {
    // Collect all form data
    const name = inputCommunityName.value.trim();
    const slug = inputCommunitySlug.value.trim();
    const email = inputEmailId.value.trim();
    const phone = inputPhoneNumber.value.trim();
    const countryCode = selectedCountryCode.textContent;
    const website = inputWebsiteUrl.value.trim();
    const mission = inputMission.value.trim();
    const vision = inputVision.value.trim();
    const description = inputCommunityDesc.value.trim();
    const category = categoryTrigger.dataset.value || '';
    const specialization = specializationTrigger.dataset.value || '';
    const foundedDate = inputFoundedDate.value;
    const memberCount = parseInt(inputMemberCount.value) || 0;
    const visibility = document.querySelector('input[name="visibility"]:checked').value;
    const approvalMode = document.querySelector('input[name="approval-mode"]:checked').value;

    const features = [];
    if (document.getElementById('feat-events').checked) features.push('Events');
    if (document.getElementById('feat-forum').checked) features.push('Discussion Forum');
    if (document.getElementById('feat-library').checked) features.push('Resources Library');
    if (document.getElementById('feat-jobs').checked) features.push('Job Board');
    if (document.getElementById('feat-ai').checked) features.push('AI Assistant');

    const settings = {
      requireProfile: document.getElementById('req-profile').checked,
      requireVerification: document.getElementById('req-verification').checked,
      allowGuests: document.getElementById('allow-guests').checked,
      allowPublicPosts: document.getElementById('allow-public-posts').checked,
      allowInvitations: document.getElementById('allow-invitations').checked,
    };

    // Save to state
    state.communityData = {
      name, slug, email, phone: `${countryCode} ${phone}`,
      website, mission, vision, description,
      category, specialization, foundedDate,
      memberCount, visibility, approvalMode,
      features, settings, tags: [...state.tags],
      industries: [...state.industries],
      logoDataUrl: state.logoDataUrl,
      createdAt: new Date().toISOString()
    };

    // Show success modal
    document.getElementById('published-community-title').textContent = `${name} is Live!`;
    document.getElementById('published-slug-link').textContent = `connect.com/${slug}`;
    document.getElementById('published-visibility-badge').textContent = visibility;
    document.getElementById('published-features-list').textContent = features.length > 0 ? features.join(', ') : 'None enabled';

    toggleModal(modalSuccessPublish, true);
    triggerConfettiShower();
  };

  /* ==========================================================================
     10. Save Draft
     ========================================================================== */

  const triggerSaveDraft = () => toggleModal(modalDraftSaved, true);
  headerSaveDraft.addEventListener('click', triggerSaveDraft);
  footerBtnSave.addEventListener('click', triggerSaveDraft);
  document.getElementById('btn-close-draft-modal').addEventListener('click', () => toggleModal(modalDraftSaved, false));

  /* ==========================================================================
     11. Success Modal → Go to Dashboard
     ========================================================================== */

  document.getElementById('btn-success-go-dashboard').addEventListener('click', () => {
    toggleModal(modalSuccessPublish, false);
    showDashboard();
  });

  /* ==========================================================================
     12. Confetti
     ========================================================================== */

  const triggerConfettiShower = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#F97316', '#FB923C', '#10B981'] });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#F97316', '#FB923C', '#10B981'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  /* ==========================================================================
     13. Show Dashboard
     ========================================================================== */

  const showDashboard = () => {
    creationWizard.classList.add('hidden');
    communityDashboard.classList.remove('hidden');
    document.body.style.paddingBottom = '0';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    populateDashboard();
    lucide.createIcons();
  };

  const populateDashboard = () => {
    const d = state.communityData;
    if (!d) return;

    // Header
    document.getElementById('dash-community-name').textContent = d.name;
    document.getElementById('dash-slug-display').textContent = `connect.com/${d.slug}`;
    document.getElementById('dash-visibility-badge').textContent = d.visibility;

    // Logo
    const dashLogoImg = document.getElementById('dash-logo-img');
    const dashLogoLetter = document.getElementById('dash-logo-letter');
    if (d.logoDataUrl) {
      dashLogoImg.src = d.logoDataUrl;
      dashLogoImg.classList.remove('hidden');
      dashLogoLetter.classList.add('hidden');
    } else {
      dashLogoLetter.textContent = d.name.charAt(0).toUpperCase();
    }

    // Overview Info
    populateOverviewInfo(d);

    // Stats
    const activeMembers = mockMembers.filter(m => m.status === 'active').length;
    const admins = mockMembers.filter(m => m.role === 'admin' || m.role === 'main-admin').length;
    const joinedThisWeek = mockMembers.filter(m => {
      const join = new Date(m.joinDate);
      const now = new Date();
      const diff = (now - join) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;

    document.getElementById('stat-total-members').textContent = mockMembers.length;
    document.getElementById('stat-active-today').textContent = activeMembers;
    document.getElementById('stat-joined-week').textContent = joinedThisWeek;
    document.getElementById('stat-admins').textContent = admins;

    // Analytics stats
    document.getElementById('an-total').textContent = mockMembers.length;
    document.getElementById('an-new').textContent = joinedThisWeek;
    document.getElementById('an-active').textContent = activeMembers;
    document.getElementById('an-growth').textContent = '18%';

    // Render permissions table
    renderPermissionsTable();

    // Render analytics
    renderAnalyticsMemberTable(mockMembers);
    renderGrowthChart();
  };

  const populateOverviewInfo = (d) => {
    const infoBody = document.getElementById('dash-info-body');
    const settingsBody = document.getElementById('dash-settings-body');

    const infoRows = [
      { icon: 'mail', label: 'Email', value: d.email },
      { icon: 'phone', label: 'Phone', value: d.phone },
      { icon: 'globe', label: 'Website', value: d.website || 'Not provided' },
      { icon: 'calendar', label: 'Founded', value: d.foundedDate || 'Not specified' },
      { icon: 'layers', label: 'Category', value: d.category },
      { icon: 'tag', label: 'Specialization', value: d.specialization },
      { icon: 'users-2', label: 'Member Count', value: d.memberCount.toLocaleString() + ' members' },
      { icon: 'file-text', label: 'Description', value: d.description },
      { icon: 'heart', label: 'Mission', value: d.mission || 'Not provided' },
      { icon: 'star', label: 'Tags', value: d.tags.length > 0 ? d.tags.join(', ') : 'No tags' },
    ];

    infoBody.innerHTML = '';
    infoRows.forEach(row => {
      infoBody.innerHTML += `
        <div class="dash-info-row">
          <div class="dash-info-icon"><i data-lucide="${row.icon}"></i></div>
          <div class="dash-info-content">
            <div class="dash-info-label">${row.label}</div>
            <div class="dash-info-value">${row.value}</div>
          </div>
        </div>
      `;
    });

    // Settings summary
    const s = d.settings;
    settingsBody.innerHTML = '';
    const settingItems = [
      { label: 'Membership Approval', value: d.approvalMode, type: 'text' },
      { label: 'Visibility', value: d.visibility, type: 'text' },
      { label: 'Require Profile Completion', value: s.requireProfile },
      { label: 'Require Email Verification', value: s.requireVerification },
      { label: 'Allow Guests', value: s.allowGuests },
      { label: 'Allow Public Posts', value: s.allowPublicPosts },
      { label: 'Allow Member Invitations', value: s.allowInvitations },
    ];

    settingItems.forEach(item => {
      if (item.type === 'text') {
        settingsBody.innerHTML += `
          <div class="dash-settings-item">
            <span class="dash-settings-item-label">${item.label}</span>
            <span class="dash-settings-badge feature">${item.value}</span>
          </div>
        `;
      } else {
        settingsBody.innerHTML += `
          <div class="dash-settings-item">
            <span class="dash-settings-item-label">${item.label}</span>
            <span class="dash-settings-badge ${item.value ? 'on' : 'off'}">${item.value ? 'Enabled' : 'Disabled'}</span>
          </div>
        `;
      }
    });

    // Features
    if (d.features.length > 0) {
      settingsBody.innerHTML += `<div style="margin-top:10px;padding-top:12px;border-top:1px solid var(--color-gray-100)"><div class="dash-info-label" style="margin-bottom:8px">Enabled Features</div>`;
      d.features.forEach(f => {
        settingsBody.innerHTML += `<span class="dash-settings-badge feature" style="margin-right:6px;margin-bottom:6px;display:inline-block">${f}</span>`;
      });
      settingsBody.innerHTML += `</div>`;
    }

    lucide.createIcons();
  };

  /* ==========================================================================
     14. Dashboard Tabs
     ========================================================================== */

  document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.dash-tab-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      const panelId = `tab-${tab.dataset.tab}`;
      document.getElementById(panelId).classList.remove('hidden');
    });
  });

  /* ==========================================================================
     15. Admin Permissions Table
     ========================================================================== */

  const renderPermissionsTable = () => {
    const tbody = document.getElementById('perm-members-tbody');
    tbody.innerHTML = '';

    mockMembers.forEach(member => {
      const perms = memberPermissions[member.id];
      const isMainAdmin = member.isCurrentAdmin;

      const roleClass = member.role === 'main-admin' ? 'main-admin' :
                        member.role === 'admin' ? 'admin' :
                        member.role === 'moderator' ? 'moderator' : 'member';

      const roleLabel = member.role === 'main-admin' ? 'Main Admin' :
                        member.role === 'admin' ? 'Admin' :
                        member.role === 'moderator' ? 'Moderator' : 'Member';

      const permKeys = ['memberMgmt', 'adminMgmt', 'content', 'events', 'comms', 'moderation', 'analytics'];

      let permCells = '';
      if (isMainAdmin) {
        // Main admin has all permissions locked on
        permKeys.forEach(() => {
          permCells += `<td><span class="perm-main-admin-lock"><i data-lucide="lock"></i> Always</span></td>`;
        });
      } else {
        permKeys.forEach(key => {
          const checked = perms[key] ? 'checked' : '';
          permCells += `
            <td>
              <label class="perm-checkbox-toggle">
                <input type="checkbox" ${checked} data-member="${member.id}" data-perm="${key}" class="perm-toggle-input">
              </label>
            </td>
          `;
        });
      }

      tbody.innerHTML += `
        <tr>
          <td>
            <div class="perm-member-info">
              <div class="perm-member-avatar" style="background:${member.color}">${member.initials}</div>
              <div class="perm-member-details">
                <h5>${member.name} ${isMainAdmin ? '(You)' : ''}</h5>
                <span>${member.email}</span>
              </div>
            </div>
          </td>
          <td><span class="perm-role-badge ${roleClass}">${roleLabel}</span></td>
          ${permCells}
        </tr>
      `;
    });

    lucide.createIcons();

    // Wire toggle events
    tbody.querySelectorAll('.perm-toggle-input').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const memberId = parseInt(e.target.dataset.member);
        const permKey = e.target.dataset.perm;
        memberPermissions[memberId][permKey] = e.target.checked;
      });
    });
  };

  /* ==========================================================================
     16. Analytics – Growth Chart & Member Table
     ========================================================================== */

  const renderGrowthChart = () => {
    const chartArea = document.getElementById('growth-chart');
    if (!chartArea) return;

    const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'];
    const values = [2, 5, 4, 8, 6, 11, 9];
    const maxVal = Math.max(...values);

    chartArea.innerHTML = '';
    weeks.forEach((week, i) => {
      const heightPct = (values[i] / maxVal) * 100;
      chartArea.innerHTML += `
        <div class="chart-bar-group">
          <div class="chart-bar-value">${values[i]}</div>
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height:${heightPct}%" title="${values[i]} members joined in ${week}"></div>
          </div>
          <div class="chart-bar-label">${week}</div>
        </div>
      `;
    });
  };

  let allMembersForTable = [...mockMembers];

  const renderAnalyticsMemberTable = (members) => {
    const tbody = document.getElementById('member-join-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--color-gray-400);padding:32px">No members found.</td></tr>';
      return;
    }

    members.forEach((member, i) => {
      const roleLabel = member.role === 'main-admin' ? 'Main Admin' :
                        member.role === 'admin' ? 'Admin' :
                        member.role === 'moderator' ? 'Moderator' : 'Member';
      const statusClass = member.status;

      tbody.innerHTML += `
        <tr>
          <td class="member-join-number">${i + 1}</td>
          <td>
            <div class="member-join-avatar-name">
              <div class="member-join-avatar" style="background:${member.color}">${member.initials}</div>
              <div>
                <div class="member-join-name">${member.name}</div>
              </div>
            </div>
          </td>
          <td class="member-join-email">${member.email}</td>
          <td><span class="perm-role-badge ${member.role === 'main-admin' ? 'main-admin' : member.role}">${roleLabel}</span></td>
          <td>${formatDate(member.joinDate)}</td>
          <td>${member.joinTime}</td>
          <td><span class="member-status-pill ${statusClass}">${capitalize(member.status)}</span></td>
        </tr>
      `;
    });
  };

  // Analytics search
  document.getElementById('analytics-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = allMembersForTable.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.includes(q)
    );
    renderAnalyticsMemberTable(filtered);
  });

  // Analytics period filter (re-renders with same data for demo)
  document.getElementById('analytics-period').addEventListener('change', () => {
    renderAnalyticsMemberTable(allMembersForTable);
    renderGrowthChart();
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  /* ==========================================================================
     17. Dashboard Header Buttons – Edit & Delete
     ========================================================================== */

  // Edit button (from header or overview card)
  const openEditModal = () => {
    const d = state.communityData;
    if (!d) return;
    document.getElementById('edit-name').value = d.name;
    document.getElementById('edit-email').value = d.email;
    document.getElementById('edit-phone').value = d.phone;
    document.getElementById('edit-website').value = d.website;
    document.getElementById('edit-description').value = d.description;
    document.getElementById('edit-mission').value = d.mission;
    document.getElementById('edit-vision').value = d.vision;
    toggleModal(modalEditCommunity, true);
    lucide.createIcons();
  };

  document.getElementById('dash-btn-edit').addEventListener('click', openEditModal);
  document.getElementById('dash-edit-details-btn').addEventListener('click', openEditModal);
  document.getElementById('btn-close-edit-modal').addEventListener('click', () => toggleModal(modalEditCommunity, false));
  document.getElementById('btn-cancel-edit').addEventListener('click', () => toggleModal(modalEditCommunity, false));

  document.getElementById('btn-save-edit').addEventListener('click', () => {
    const editName = document.getElementById('edit-name').value.trim();
    const editEmail = document.getElementById('edit-email').value.trim();
    const editPhone = document.getElementById('edit-phone').value.trim();

    // Basic validation
    let valid = true;
    if (!editName) { document.getElementById('edit-err-name').textContent = 'Name is required'; valid = false; } else { document.getElementById('edit-err-name').textContent = ''; }
    if (!validateEmail(editEmail)) { document.getElementById('edit-err-email').textContent = 'Valid email required'; valid = false; } else { document.getElementById('edit-err-email').textContent = ''; }
    if (!editPhone) { document.getElementById('edit-err-phone').textContent = 'Phone is required'; valid = false; } else { document.getElementById('edit-err-phone').textContent = ''; }
    if (!document.getElementById('edit-description').value.trim()) { document.getElementById('edit-err-desc').textContent = 'Description is required'; valid = false; } else { document.getElementById('edit-err-desc').textContent = ''; }

    if (!valid) return;

    // Save changes to communityData
    state.communityData.name = editName;
    state.communityData.email = editEmail;
    state.communityData.phone = editPhone;
    state.communityData.website = document.getElementById('edit-website').value.trim();
    state.communityData.description = document.getElementById('edit-description').value.trim();
    state.communityData.mission = document.getElementById('edit-mission').value.trim();
    state.communityData.vision = document.getElementById('edit-vision').value.trim();

    toggleModal(modalEditCommunity, false);

    // Re-populate dashboard with updated data
    document.getElementById('dash-community-name').textContent = state.communityData.name;
    populateOverviewInfo(state.communityData);
  });

  // Delete button
  document.getElementById('dash-btn-delete').addEventListener('click', () => {
    const name = state.communityData ? state.communityData.name : 'community';
    document.getElementById('delete-community-name-hint').textContent = `"${name}"`;
    document.getElementById('delete-confirm-input').value = '';
    document.getElementById('btn-confirm-delete').disabled = true;
    toggleModal(modalDeleteConfirm, true);
    lucide.createIcons();
  });

  document.getElementById('delete-confirm-input').addEventListener('input', (e) => {
    const name = state.communityData ? state.communityData.name : '';
    document.getElementById('btn-confirm-delete').disabled = e.target.value.trim() !== name;
  });

  document.getElementById('btn-cancel-delete').addEventListener('click', () => toggleModal(modalDeleteConfirm, false));

  document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    toggleModal(modalDeleteConfirm, false);
    // Reset everything and go back to creation wizard
    state.communityData = null;
    communityDashboard.classList.add('hidden');
    creationWizard.classList.remove('hidden');
    document.body.style.paddingBottom = '96px';
    // Reset form
    communityForm.reset();
    state.industries = [];
    state.tags = [];
    state.logoDataUrl = null;
    renderIndustryChips();
    renderTagChips();
    uploadPlaceholderState.classList.remove('hidden');
    uploadPreviewState.classList.add('hidden');
    logoImgPreview.src = '';
    inputCommunitySlug.dataset.customized = '';
    state.currentStep = 1;
    formPanes.forEach(p => { p.classList.remove('active'); p.style.opacity = ''; p.style.transform = ''; });
    document.getElementById('pane-step-1').classList.add('active');
    updateStepperUI();
    window.scrollTo({ top: 0 });
  });

  // Close modals when clicking overlay
  [modalEditCommunity, modalDeleteConfirm, modalDraftSaved, modalSuccessPublish].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (modal === modalDeleteConfirm) return; // Don't close delete by accident
        toggleModal(modal, false);
      }
    });
  });

  // Initialize stepper UI
  updateStepperUI();
});
