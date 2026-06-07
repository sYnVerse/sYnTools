memory=$(awk '/MemTotal/{print $2}' /proc/meminfo);
memory=$((memory / 1024));
node_options="--max-old-space-size=4096";
echo "NODE_OPTIONS=$node_options";
export NODE_OPTIONS="$node_options";
