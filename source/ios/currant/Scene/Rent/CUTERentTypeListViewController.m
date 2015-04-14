//
//  CUTERentTypeListViewController.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTypeListViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTERentTypeListForm.h"
#import "CUTEFormDefaultCell.h"
#import "CUTEDataManager.h"
#import "CUTEEnumManager.h"
#import "CUTETicket.h"
#import "CUTERentTypeListForm.h"


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
    CUTERentTypeListForm *form = (CUTERentTypeListForm *)[self.formController form];
    ticket.rentType = [form rentTypeAtIndex:indexPath.row];
    CUTEProperty *property = [CUTEProperty new];
    ticket.property = property;

    [[CUTEDataManager sharedInstance] pushRentTicket:ticket];
}

@end
