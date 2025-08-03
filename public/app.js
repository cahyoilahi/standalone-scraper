document.addEventListener('DOMContentLoaded', () => {
    const scrapeBtn = document.getElementById('scrape-btn');
    const usernameInput = document.getElementById('username-input');
    const resultContainer = document.getElementById('result-container');
    const followerCountEl = document.getElementById('follower-count');
    const errorMessageEl = document.getElementById('error-message');

    scrapeBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        if (!username) {
            alert('Harap masukkan username.');
            return;
        }

        // Tampilkan status loading
        resultContainer.classList.remove('hidden');
        followerCountEl.textContent = 'Mencari...';
        errorMessageEl.textContent = '';
        scrapeBtn.disabled = true;
        scrapeBtn.textContent = 'Loading...';

        try {
            // Panggil backend scraper kita
            const response = await fetch('/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username }),
            });

            const data = await response.json();

            if (response.ok && data.followers > 0) {
                // Format angka dengan pemisah ribuan
                followerCountEl.textContent = data.followers.toLocaleString('id-ID');
            } else {
                followerCountEl.textContent = '-';
                errorMessageEl.textContent = data.error || 'Gagal mengambil data.';
            }

        } catch (error) {
            followerCountEl.textContent = '-';
            errorMessageEl.textContent = 'Terjadi kesalahan jaringan.';
            console.error('Error:', error);
        } finally {
            // Kembalikan tombol ke keadaan normal
            scrapeBtn.disabled = false;
            scrapeBtn.textContent = 'Cek Sekarang';
        }
    });
});
