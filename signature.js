document.addEventListener('DOMContentLoaded', function () {
    // Set active navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (currentPage === linkPage || 
            (currentPage === 'signature.html' && linkPage === 'signature.html')) {
            link.classList.add('active');
        }
    });

    // Set signature title based on type
    if (currentPage === 'signature.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        const titleElement = document.getElementById('signature-title');
        
        if (type === 'wbdc') {
            titleElement.textContent = 'WBDC Signature Generator';
        } else if (type === 'staff') {
            titleElement.textContent = 'Staff Signature Generator';
        }
    }

    // Add event listeners
    document.getElementById('template').addEventListener('change', handleTemplateChange);
    document.getElementById('downloadBtn').addEventListener('click', downloadSignature);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('generateBtn').addEventListener('click', generateSignature); // if you have a button for it
});

// Handle dynamic fields based on template
function handleTemplateChange() {
    const template = this.value;
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';

    if (template === 'easyfin') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label for="title">Title:</label>
                <select id="title" required>
                    <option value="" disabled selected>Select your title</option>
                    <option value="Admin Clerk">Admin Clerk</option>
                    <option value="Branch Manager">Branch Manager</option>
                </select>
            </div>
            <div class="form-group">
                <input type="text" id="branch" placeholder="Branch" required>
            </div>
        `;
    } else if (template === 'wbdc') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label for="title">Title:</label>
                <select id="title" required>
                    <option value="" disabled selected>Select your title</option>
                    <option value="Call Centre Supervisor">Call Centre Supervisor</option>
                    <option value="Call Centre Agent">Call Centre Agent</option>
                    <option value="Field Operations Manager">Field Operations Manager</option>
                    <option value="Field Collections Agent">Field Collections Agent</option>
                    <option value="Legal Department Supervisor">Legal Department Supervisor</option>
                    <option value="Legal Collections Officer">Legal Collections Officer</option>
                    <option value="Pre-Legal Collections Officer">Pre-Legal Collections Officer</option>
                    <option value="General Manager">General Manager</option>
                </select>
            </div>
            <div class="form-group">
                <label for="branch">Department:</label>
                <select id="branch" required>
                    <option value="" disabled selected>Select your department</option>
                    <option value="Call Centre">Call Centre</option>
                    <option value="Pre-Legal Collections Department">Pre-Legal Collections Department</option>
                    <option value="Tracing & Investigations">Tracing & Investigations</option>
                    <option value="Legal Collections Department">Legal Collections Department</option>
                </select>
            </div>
        `;
    }
}

// Generate the signature
function generateSignature() {
    const template = document.getElementById('template').value;
    const name = document.getElementById('name')?.value || '';
    const title = document.getElementById('title')?.value || '';
    const branch = document.getElementById('branch')?.value || '';
    const tel = document.getElementById('tel')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const address = document.getElementById('address')?.value || '';

    if (!template || !name || !title || !branch || !tel || !email || !address) {
        alert("Please fill in all fields.");
        return;
    }

    let logoPath, bannerPath, phoneIcon, emailIcon, addressIcon;

    if (template === 'wbdc') {
        logoPath = 'https://i.postimg.cc/5NrBfDCf/logoonlypng2.png';
        bannerPath = 'https://i.postimg.cc/zXBJCGGF/wordingonly.png';
        phoneIcon = 'https://i.postimg.cc/FK3gWG1N/telephone-logo.png';
        emailIcon = 'https://i.postimg.cc/KvmL7L63/Email-Logo.png';
        addressIcon = 'https://i.postimg.cc/wBW2s2fV/address-logo.png';
    } else {
        logoPath = 'https://i.postimg.cc/4dPL4HjR/Budget-Logo-edited.png';
        bannerPath = 'https://i.postimg.cc/nzQdBVRC/Easfin-Banner.png';
        phoneIcon = 'https://i.postimg.cc/GhRf6Hnf/telephone-logo.png';
        emailIcon = 'https://i.postimg.cc/GhBBwhPk/Email-Logo.png';
        addressIcon = 'https://i.postimg.cc/qRgbX3nt/address-logo.png';
    }

    const signatureHTML = `
<table width="400" style="width:400px;font-size:9pt;font-family:Arial,sans-serif;line-height:normal;background-color: white;" cellspacing="0" cellpadding="0">
    <tbody>
        <tr>
            <td style="padding-bottom: 6px;">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td width="100" style="text-align:center;border-right:1px solid #d8d8d8;padding-right:18px;">
                            <img alt="Company Logo" src="${logoPath}" width="100">
                        </td>
                        <td style="padding-left:18px;">
                            <div style="font-size:20px;font-weight:600;color:#222;text-transform:uppercase;">
                                ${name}<br>
                                <span style="font-weight:400;font-size:16px;text-transform:none;">${title}</span>
                            </div>
                            <div style="font-size:11px;font-weight:600;color:#222;text-transform:uppercase;">
                                ${branch}
                            </div>
                            <div style="font-size:13px;color:#575756;margin-top:5px;">
                                <div><img src="${phoneIcon}" width="10" alt="Phone"> <a href="tel:${tel}" style="color:#222;text-decoration:none;">${tel}</a></div>
                                <div><img src="${emailIcon}" width="10" alt="Email"> <a href="mailto:${email}" style="color:#222;text-decoration:none;">${email}</a></div>
                                <div><img src="${addressIcon}" width="10" alt="Address"> <span>${address}</span></div>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td><img src="${bannerPath}" width="400" alt="Banner"></td>
        </tr>
    </tbody>
</table>`;

    document.getElementById('generatedSignature').innerHTML = signatureHTML;
    document.getElementById('copyBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
}

// Copy to clipboard
function copyToClipboard() {
    const range = document.createRange();
    range.selectNode(document.getElementById("generatedSignature"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
        const success = document.execCommand('copy');
        alert(success ? 'Signature copied!' : 'Copy failed.');
    } catch (err) {
        alert('Copy not supported.');
    }
    window.getSelection().removeAllRanges();
}

// Download as image
function downloadSignature() {
    const signatureElement = document.getElementById('generatedSignature');
    
    signatureElement.style.padding = '20px';
    signatureElement.style.backgroundColor = 'white';
    
    html2canvas(signatureElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'email-signature.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        signatureElement.style.padding = '';
        signatureElement.style.backgroundColor = '';
    }).catch(err => {
        console.error('Error generating image:', err);
        alert('Error generating signature image. Please try again.');
    });
}