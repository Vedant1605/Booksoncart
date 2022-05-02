const deleteProduct = (btn) => {
    // console.log('Clicked')
    const productId = btn.parentNode.querySelector('[name=productId]').value
    const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value
    const productElement = btn.closest('article')
    fetch(`/admin/admin-product/${productId}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrfToken
        }
    }).then(result => {
        return result.json()
    })
        .then(data => {
            console.log('data', data);
            productElement.remove()
        })
        .catch(err => {
            console.log('err', err)
        })

}