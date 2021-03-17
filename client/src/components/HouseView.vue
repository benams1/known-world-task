<template>
    <li>
        <div class="container">
            <div>
                {{house.name}}
            </div>
            <div>
                {{house.score}}
            </div>
        </div>
    </li>
</template>

<script>

    export default {
        name: "HouseView",
        props: ['house']
    }

</script>

<style scoped>
    .container{
        display: flex;
        justify-content: space-between;
    }
</style>