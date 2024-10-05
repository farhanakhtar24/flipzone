"use client";
// import { useRouter } from "next/navigation";
import React, { useState } from "react";

const SearchBar = () => {
	// const router = useRouter();
	const [search, setSearch] = useState("");
	return (
		<input
			type="text"
			placeholder="Search"
			className="hidden w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm md:block"
			value={search}
			onChange={(e) => setSearch(e.target.value)}
			onKeyDown={() => {
				// if (e.key === "Enter" && search) {
				// 	router.push(`/product/search/${search}`);
				// 	setSearch("");
				// }
			}}
		/>
	);
};

export default SearchBar;
