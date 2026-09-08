// ============================
// Experience Calculator - Core JS
// ============================

let jobCounter = 1; // Track karega ki abhi tak kitne jobs bane hain (unique ID ke liye)
let lastResultText = ""; // Sabse recent calculate hue result ka copy-friendly text yahan store hoga

// Page load hote hi ye function chalega
document.addEventListener("DOMContentLoaded", function () {
    setupScrollAnimations(); // Sections ko scroll pe fade-in karne ka logic
    populateYearDropdowns(); // Sabse pehle jo card already hai, uske year dropdowns fill karo
    setupCurrentJobCheckbox(document.querySelector('.job-card[data-job-id="1"]')); // Checkbox logic attach karo

    // "Add Another Job" button click event
    document.getElementById("addJobBtn").addEventListener("click", addNewJobCard);

    // "Calculate My Experience" button click event
    document.getElementById("calculateBtn").addEventListener("click", calculateExperience);

    // "Copy Result" button click event
    document.getElementById("copyResultBtn").addEventListener("click", copyResultToClipboard);

    // Share buttons click events
    document.getElementById("shareWhatsappBtn").addEventListener("click", function () {
        shareResult("whatsapp");
    });
    document.getElementById("shareLinkedinBtn").addEventListener("click", function () {
        shareResult("linkedin");
    });
});


// Function: Start Year / End Year dropdown ko years se bharta hai
function populateYearDropdowns(card) {
    // Agar specific card diya hai toh sirf uske andar dhundo, warna poore page mein
    const scope = card || document;
    const yearSelects = scope.querySelectorAll(".start-year, .end-year");

    const currentYear = new Date().getFullYear();
    const startFromYear = 1950; // Sabse purana saal jo hum allow karenge

    yearSelects.forEach(function (select) {
        // Agar already options bhare hain (jaise dobara call ho gaya), toh skip karo
        if (select.options.length > 0) return;

        // Default placeholder option
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Year";
        select.appendChild(placeholder);

        // Current year se lekar 1950 tak (ulta order, latest year sabse upar)
        for (let year = currentYear; year >= startFromYear; year--) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        }
    });
}

// Function: Naya job card add karta hai
function addNewJobCard() {
    jobCounter++; // Naya unique ID

    const container = document.getElementById("jobCardsContainer");
    const newCardHtml = `
        <div class="card job-card shadow-sm mb-3" data-job-id="${jobCounter}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="card-title fw-bold mb-0">Experience #${jobCounter}</h5>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-job-btn">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="row g-3">
                    <div class="col-6 col-md-3">
                        <label class="form-label small fw-semibold">Start Month</label>
                        <select class="form-select start-month" aria-label="Start Month">
                            <option value="">Month</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small fw-semibold">Start Year</label>
                        <select class="form-select start-year" aria-label="Start Year"></select>
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small fw-semibold">End Month</label>
                        <select class="form-select end-month" aria-label="End Month">
                            <option value="">Month</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small fw-semibold">End Year</label>
                        <select class="form-select end-year" aria-label="End Year"></select>
                    </div>
                </div>
                <div class="form-check mt-3">
                    <input class="form-check-input current-job-check" type="checkbox" id="currentJob${jobCounter}">
                    <label class="form-check-label small" for="currentJob${jobCounter}">
                        I currently work here
                    </label>
                </div>
            </div>
        </div>
    `;

    // Naya card container ke end mein daalo
    container.insertAdjacentHTML("beforeend", newCardHtml);

    // Naye card ka reference lo (jo abhi-abhi add hua)
    const newCard = container.querySelector(`.job-card[data-job-id="${jobCounter}"]`);

    // Naye card ke year dropdowns bharo
    populateYearDropdowns(newCard);

    // Naye card ka checkbox logic attach karo
    setupCurrentJobCheckbox(newCard);

    // Naye card ke "Remove" button ka click event attach karo
    newCard.querySelector(".remove-job-btn").addEventListener("click", function () {
        removeJobCard(newCard);
    });
}


// Function: Job card ko safely remove karta hai (last card ko delete nahi hone deta)
function removeJobCard(card) {
    const allCards = document.querySelectorAll(".job-card");

    if (allCards.length <= 1) {
        // Sirf ek hi card bacha hai, use delete nahi karne denge
        showToast("At least one experience period is required.", "warning");
        return;
    }

    card.remove(); // Card ko DOM se hata do
    renumberJobCards(); // Baaki cards ke titles update karo
}

// Function: Sab job cards ke "Experience #X" title ko sequentially renumber karta hai
function renumberJobCards() {
    const allCards = document.querySelectorAll(".job-card");

    allCards.forEach(function (card, index) {
        const titleEl = card.querySelector(".card-title");
        titleEl.textContent = `Experience #${index + 1}`;
    });
}

// Function: Chhota notification message dikhata hai (Bootstrap Toast jaisा simple version)
function showToast(message, type = "info") {
    // Agar pehle se koi toast container nahi hai, toh ek banao
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.style.position = "fixed";
        toastContainer.style.bottom = "20px";
        toastContainer.style.right = "20px";
        toastContainer.style.zIndex = "9999";
        document.body.appendChild(toastContainer);
    }

    const alertClass = type === "warning" ? "alert-warning"
        : type === "danger" ? "alert-danger"
            : type === "success" ? "alert-success"
                : "alert-info";

    const toastEl = document.createElement("div");
    toastEl.className = `alert ${alertClass} shadow-sm mb-2`;
    toastEl.style.minWidth = "260px";
    toastEl.textContent = message;

    toastContainer.appendChild(toastEl);

    // 3 second baad automatically hata do
    setTimeout(function () {
        toastEl.remove();
    }, 3000);
}
// Function: "Currently Working" checkbox ka logic (End Month/Year disable karna)
// Iski full functionality Step 13 mein banayenge, abhi sirf placeholder function
// Function: "Currently Working" checkbox ka logic
function setupCurrentJobCheckbox(card) {
    const checkbox = card.querySelector(".current-job-check");
    const endMonthSelect = card.querySelector(".end-month");
    const endYearSelect = card.querySelector(".end-year");

    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            // Currently working hai -> End Month/Year disable karo aur clear karo
            endMonthSelect.value = "";
            endYearSelect.value = "";
            endMonthSelect.disabled = true;
            endYearSelect.disabled = true;
        } else {
            // Currently working uncheck kiya -> wapas enable karo
            endMonthSelect.disabled = false;
            endYearSelect.disabled = false;
        }
    });
}

// Function: Ek job card ka data read karke validate karta hai
// Return karta hai: { valid: true/false, data: {...}, error: "message" }
function readAndValidateCard(card, index) {
    const startMonth = parseInt(card.querySelector(".start-month").value);
    const startYear = parseInt(card.querySelector(".start-year").value);
    const isCurrentJob = card.querySelector(".current-job-check").checked;

    let endMonth = parseInt(card.querySelector(".end-month").value);
    let endYear = parseInt(card.querySelector(".end-year").value);

    const cardLabel = `Experience #${index + 1}`;

    // Check 1: Start Month/Year khali toh nahi hai
    if (isNaN(startMonth) || isNaN(startYear)) {
        return { valid: false, error: `${cardLabel}: Please select a start month and year.` };
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JS mein month 0-indexed hota hai, isliye +1
    const currentYear = now.getFullYear();

    // Check 2: Start date future mein toh nahi hai
    if (startYear > currentYear || (startYear === currentYear && startMonth > currentMonth)) {
        return { valid: false, error: `${cardLabel}: Start date cannot be in the future.` };
    }

    // Agar currently working hai, toh end date = aaj ki date
    if (isCurrentJob) {
        endMonth = currentMonth;
        endYear = currentYear;
    } else {
        // Check 3: Agar currently working nahi hai, toh End Month/Year khali toh nahi hai
        if (isNaN(endMonth) || isNaN(endYear)) {
            return { valid: false, error: `${cardLabel}: Please select an end month and year, or check "Currently Working".` };
        }
    }

    // Check 4: End date, Start date se pehle toh nahi hai
    const startTotalMonths = startYear * 12 + startMonth;
    const endTotalMonths = endYear * 12 + endMonth;

    if (endTotalMonths < startTotalMonths) {
        return { valid: false, error: `${cardLabel}: End date cannot be before start date.` };
    }

    // Sab sahi hai -> data return karo
    return {
        valid: true,
        data: {
            startMonth: startMonth,
            startYear: startYear,
            endMonth: endMonth,
            endYear: endYear,
            isCurrentJob: isCurrentJob
        }
    };
}

// Function: Sab job cards padh kar total experience calculate karta hai
function calculateExperience() {
    // Chhota "pressed" micro-interaction — button thoda chhota hoke wapas normal ho jaata hai
    const calculateBtn = document.getElementById("calculateBtn");
    calculateBtn.classList.add("btn-pressed");
    setTimeout(function () {
        calculateBtn.classList.remove("btn-pressed");
    }, 200);

    const allCards = document.querySelectorAll(".job-card");
    const validPeriods = []; // Sab valid periods yahan store honge { startTotalMonths, endTotalMonths }

    // Har card ko loop karke validate karo
    for (let i = 0; i < allCards.length; i++) {
        const result = readAndValidateCard(allCards[i], i);

        if (!result.valid) {
            // Error mila -> turant rok do aur message dikhao
            showToast(result.error, "danger");
            return;
        }

        const data = result.data;
        const startTotalMonths = data.startYear * 12 + data.startMonth;
        const endTotalMonths = data.endYear * 12 + data.endMonth;

        validPeriods.push({
            startTotalMonths: startTotalMonths,
            endTotalMonths: endTotalMonths
        });
    }

    // Abhi ke liye simple total (overlap handling Step 15 mein aayega)
    // Overlapping periods ko merge karo (double-counting rokne ke liye)
    const mergedPeriods = mergeOverlappingPeriods(validPeriods);

    // Ab merged (non-overlapping) periods ka total nikalo
    let totalMonths = 0;
    mergedPeriods.forEach(function (period) {
        // +1 isliye kyunki inclusive counting chahiye (Jan-Jan = 1 month)
        totalMonths += (period.endTotalMonths - period.startTotalMonths) + 1;
    });

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    // Abhi ke liye result console mein dekhte hain (Step 16 mein UI banayenge)
    //console.log("Total Months (after merging overlaps):", totalMonths);
    //console.log("Total Experience:", years + " Years " + months + " Months");
    //console.log("Number of Jobs Entered:", validPeriods.length);
    //console.log("Number of Non-Overlapping Merged Periods:", mergedPeriods.length);
    // Result card mein data dikhao
    displayResult(years, months, totalMonths, validPeriods.length);
}

// Function: Overlapping periods ko merge karta hai (classic "merge intervals" algorithm)
function mergeOverlappingPeriods(periods) {
    if (periods.length === 0) return [];

    // Step 1: Start month ke hisaab se ascending order mein sort karo
    // .slice() se copy banate hain taaki original array na badle
    const sortedPeriods = periods.slice().sort(function (a, b) {
        return a.startTotalMonths - b.startTotalMonths;
    });

    // Step 2: Merged list shuru karo pehle period se
    const merged = [sortedPeriods[0]];

    // Step 3: Baaki sab periods ko check karo
    for (let i = 1; i < sortedPeriods.length; i++) {
        const current = sortedPeriods[i];
        const lastMerged = merged[merged.length - 1];

        // Overlap check: agar current period ka start, last merged period ke end se
        // pehle ya usी mahine mein shuru hota hai (ya turant agla month hai), toh overlap/adjacent hai
        if (current.startTotalMonths <= lastMerged.endTotalMonths + 1) {
            // Overlap/adjacent hai -> end ko extend karo (jo bhi bada ho)
            lastMerged.endTotalMonths = Math.max(lastMerged.endTotalMonths, current.endTotalMonths);
        } else {
            // Overlap nahi hai -> naya separate period add karo
            merged.push(current);
        }
    }

    return merged;
}

// Function: Result card mein calculated data dikhata hai
function displayResult(years, months, totalMonths, jobCount) {
    const resultCard = document.getElementById("resultCard");

    // Main text banao (grammar sahi rakhne ke liye singular/plural handle karo)
    const yearsText = years === 1 ? "1 Year" : years + " Years";
    const monthsText = months === 1 ? "1 Month" : months + " Months";

    let mainText;
    if (years === 0) {
        mainText = monthsText; // Sirf months (jaise "5 Months")
    } else if (months === 0) {
        mainText = yearsText; // Sirf years (jaise "2 Years")
    } else {
        mainText = yearsText + " " + monthsText; // Dono (jaise "2 Years 6 Months")
    }

    document.getElementById("resultMainText").textContent = mainText;
    document.getElementById("resultTotalMonths").textContent = totalMonths;
    document.getElementById("resultJobCount").textContent = jobCount;

    // Copy button ke liye friendly sentence taiyar karke store karo
    lastResultText = "My total professional experience is " + mainText.toLowerCase() + ".";

    // Card ko visible karo
    resultCard.classList.remove("d-none");

    // Smoothly result card tak scroll karo
    resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Function: Result ko clipboard mein copy karta hai
function copyResultToClipboard() {
    if (!lastResultText) {
        showToast("Please calculate your experience first.", "warning");
        return;
    }

    // Browser ka built-in Clipboard API use karte hain
    navigator.clipboard.writeText(lastResultText).then(function () {
        showToast("Result copied to clipboard!", "success");
    }).catch(function () {
        showToast("Could not copy. Please copy manually.", "danger");
    });
}

// Function: Result ko WhatsApp ya LinkedIn pe share karta hai
function shareResult(platform) {
    if (!lastResultText) {
        showToast("Please calculate your experience first.", "warning");
        return;
    }

    const pageUrl = window.location.href; // Current page ka URL
    let shareUrl = "";

    if (platform === "whatsapp") {
        // WhatsApp ka share intent link — text ko URL-encode karna zaroori hai
        const message = lastResultText + " Calculate yours here: " + pageUrl;
        shareUrl = "https://wa.me/?text=" + encodeURIComponent(message);
    } else if (platform === "linkedin") {
        // LinkedIn ka share intent link (LinkedIn sirf URL accept karta hai, text nahi)
        shareUrl = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(pageUrl);
    }

    // Naye tab mein share link kholo
    window.open(shareUrl, "_blank", "noopener,noreferrer");
}

// Function: Sections ko scroll mein aane par fade-in animate karta hai
function setupScrollAnimations() {
    const sections = document.querySelectorAll(".fade-in-section");

    // IntersectionObserver ek browser API hai jo batata hai element screen pe kab dikh raha hai
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target); // Ek baar dikh gaya, dobara check karne ki zaroorat nahi
            }
        });
    }, {
        threshold: 0.15 // Section ka 15% hissa screen pe aate hi animation trigger ho
    });

    sections.forEach(function (section) {
        observer.observe(section);
    });
}