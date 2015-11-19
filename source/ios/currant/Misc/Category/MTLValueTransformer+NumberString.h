//
//  MTLValueTransformer+NumberString.h
//  currant
//
//  Created by Foster Yin on 11/19/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "MTLValueTransformer.h"

@interface MTLValueTransformer (NumberString)

//like our server will turn the float number to sring in json for precision concern, so in client we should decode the type to NSNumber
//but json rft also support direct pass number http://rfc7159.net/rfc7159#examples
+ (instancetype)numberStringTransformer;

@end
