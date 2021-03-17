<template>
    <li>
        {{update.timestamp.format('MM/DD/YYYY HH:mm:ss')}}
        <hr class="hr-color">
        House <b>{{update.house.name}}</b>
        has moved {{update.steps}}
        steps and gained {{update.score}} strength
    </li>
</template>

<script>

    export default {
        name: 'Update',
        props: ['update']
    }

</script>

<style scoped>
    .hr-color{
        border: 1px solid black;
    }
</style>