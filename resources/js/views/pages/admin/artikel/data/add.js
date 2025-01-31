const is_edit = '{{ $is_edit }}';
$(document).ready(function () {
    $('.select2').select2({
        theme: "bootstrap-5",
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
    });
    $('#kategori').select2({
        ajax: {
            url: "{{ route(l_prefix($hpu,'kategori.select2', $min + 1)) }}",
            type: "GET",
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: function (params) {
                var query = {
                    search: params.term,
                    with_empty: 1,
                }
                return query;
            }
        },
        theme: "bootstrap-5",
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
    });

    $('#tag').select2({
        ajax: {
            url: "{{ route(l_prefix($hpu,'tag.select2', $min + 1)) }}",
            type: "GET",
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: function (params) {
                var query = {
                    search: params.term,
                    with_empty: 1,
                }
                return query;
            }
        },
        theme: "bootstrap-5",
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
    });

    tinymce.init({
        selector: '#detail',
        api_key: 'j2d5tq2icv1wikkonofi6nscvzd885ygwragb3gg04o0m52z',
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount code',
        toolbar: 'undo redo | fontsize bold italic underline strikethrough align lineheight | link image media table | addcomment showcomments | spellcheckdialog a11ycheck | checklist numlist bullist indent outdent | emoticons charmap | blocks fontfamily removeformat',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [{
            value: 'First.Name',
            title: 'First Name'
        },
        {
            value: 'Email',
            title: 'Email'
        },
        ],
        height: 700,
        image_class_list: [{
            title: 'none',
            value: ''
        },
        {
            title: 'Margin Right 1',
            value: 'me-1'
        },
        {
            title: 'Margin Right 2',
            value: 'me-2'
        },
        {
            title: 'Margin Right 3',
            value: 'me-3'
        },
        {
            title: 'Margin Right 4',
            value: 'me-4'
        },
        ],
        images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open('POST', "{{ route('image_to_base64') }}");
            xhr.setRequestHeader("X-CSRF-TOKEN", $('meta[name="csrf-token"]').attr('content'));
            xhr.upload.onprogress = (e) => {
                progress(e.loaded / e.total * 100);
            };
            xhr.onload = () => {
                if (xhr.status === 403) {
                    reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
                    return;
                }

                if (xhr.status < 200 || xhr.status >= 300) {
                    reject('HTTP Error: ' + xhr.status);
                    return;
                }

                const json = JSON.parse(xhr.responseText);

                if (!json || typeof json.base64 != 'string') {
                    reject('Invalid JSON: ' + xhr.responseText);
                    return;
                }

                resolve(json.base64);
            };

            xhr.onerror = () => {
                reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
            };

            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());

            xhr.send(formData);
        }),
        relative_urls: false,
        skin: document.querySelector('html').classList.contains('dark-theme') ? "oxide-dark" : "oxide",
        content_css: document.querySelector('html').classList.contains('dark-theme') ? "dark" : "default",
    });

    $("#nama").keyup(function () {
        var Text = $(this).val();
        $("#slug").val(Text.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-'));
    });

    // insertForm ===================================================================================
    $('#MainForm').submit(function (e) {
        e.preventDefault();
        var formData = new FormData(this);
        resetErrorAfterInput();
        setBtnLoading('button[type=submit]', 'Simpan');
        const route = "{{ $route }}";
        $.ajax({
            type: "POST",
            url: route,
            headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: (data) => {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'You will be reload in 2 Seconds',
                    showConfirmButton: false,
                    timer: 2000
                }).then(function () {
                    window.location.reload()
                });

            },
            error: function (data) {
                const res = data.responseJSON ?? {};
                errorAfterInput = [];
                for (const property in res.errors) {
                    errorAfterInput.push(property);
                    setErrorAfterInput(res.errors[property], `#${property}`);
                }
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: res.message ?? 'Something went wrong',
                    showConfirmButton: false,
                    timer: 1500
                })
            },
            complete: function () {
                setBtnLoading('button[type=submit]',
                    '<li class="fas fa-save mr-1"></li> Simpan',
                    false);
            }
        });
    });
});

function youtube_parser(url) {
    var regExp =
        /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
    var match = url.match(regExp);
    return (match && match[1].length == 11) ? match[1] : false;
}
