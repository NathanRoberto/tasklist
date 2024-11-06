fetch('/users')
    .then(response => response.json())
    .then(data => {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = data.map(user => `<p>${user.name} (${user.email})</p>`).join('');
    })
    .catch(err => console.log('Erro ao carregar os usuários', err));
