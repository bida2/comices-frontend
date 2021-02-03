<script>
import { Bar } from 'vue-chartjs'
export default {
    extends: Bar,
    props: ['priceHistory'],
    mounted: function() {
    	let priceHistory = {};
    	this.priceHistory.forEach((value) => {
    		priceHistory[value.monthOfYear] = value.priceAtMonth;
    	});
        this.renderChart({
            labels: Object.keys(priceHistory),
            datasets: [{
                label: 'Comic Price',
                backgroundColor: '#f87979',
                data: Object.values(priceHistory)
            }]
        })
    }
}
</script>