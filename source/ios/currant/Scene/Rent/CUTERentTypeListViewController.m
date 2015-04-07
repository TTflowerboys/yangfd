//
//  CUTERentTypeListViewController.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTypeListViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTERectTypeListForm.h"
#import "CUTEFormDefaultCell.h"
#import "CUTEDataManager.h"
#import "CUTEEnumManager.h"
#import "CUTETicket.h"
#import "CUTERectTypeListForm.h"


@implementation CUTERentTypeListViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        [self.formController registerDefaultFieldCellClass:[CUTEFormDefaultCell class]];
    }
    return self;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTETicket *ticket = [CUTETicket new];
    CUTERectTypeListForm *form = (CUTERectTypeListForm *)[self.formController form];
    ticket.rentType = [form rentTypeAtIndex:indexPath.row];
    
    [[CUTEDataManager sharedInstance] pushRentTicket:ticket];
}

@end
