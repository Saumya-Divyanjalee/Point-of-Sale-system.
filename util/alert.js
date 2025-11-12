export let setAlert = (type,content,row) => {
    switch (type) {
        case 'success':
            Swal.fire({
                position: "center",
                icon: "success",
                title: content,
                showConfirmButton: false,
                timer: 1500
            });
            break;
        case 'error':
            Swal.fire({
                position: "center",
                icon: "error",
                title: content,
                showConfirmButton: false,
                timer: 1500
            });
            break;
        case 'warning':
            Swal.fire({
                title: "Are you sure?",
                text: content,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    row.remove();
                    Swal.fire({
                        title: "Deleted!",
                        text: "Order Item has been deleted.",
                        icon: "success"
                    });
                }
            });
            break;
    }
}
