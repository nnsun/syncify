<template>
    <div>
        <button @click="mode = mode == 'create' ? null : 'create'">Create a room</button>
        <button @click="mode = mode == 'join' ? null : 'join'">Join a room</button>
        
        <div>
            <form v-if="mode">
                <div>
                    <label>Name
                        <input type="text" v-model="room">
                    </label>
                </div>
                <div>
                    <label>Password
                        <input type="password" v-model="password">
                    </label>
                </div>
                <input type="submit" @click="submit" value="Submit">
            </form>
        </div>
    </div>
</template>

<script>

export default {
    name: 'RoomMenu',
    data() {
        return {
            mode: null,
            room: null,
            password: null,
        }
    },

    methods: {
        submit: function() {
            this.$store.commit('setRoom', this.room)
            
        }
    }
}


</script>