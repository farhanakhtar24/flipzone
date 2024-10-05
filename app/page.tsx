import React from "react";

const page = () => {
	return (
		<div className="flex flex-col gap-10 w-full h-full">
			{Array.from({ length: 15 }).map((_, index) => (
				<div key={index} className="w-full">
					{index}
				</div>
			))}
		</div>
	);
};

export default page;
